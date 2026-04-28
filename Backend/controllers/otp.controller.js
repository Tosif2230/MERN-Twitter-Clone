import OTP from "../models/otp.model.js";
import nodemailer from "nodemailer";
import twilio from "twilio";

const OTP_TTL_MS = 5 * 60 * 1000;

const normalizePhone = (input = "") => {
  const value = input.trim().replace(/[\s()-]/g, "");
  if (value.startsWith("00")) {
    return `+${value.slice(2)}`;
  }
  return value;
};

const isValidE164Phone = (phone = "") => /^\+[1-9]\d{7,14}$/.test(phone);

const createTwilioClient = () =>
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const getTwilioConfigError = () => {
  if (!process.env.TWILIO_ACCOUNT_SID) return "Missing TWILIO_ACCOUNT_SID in backend .env";
  if (!process.env.TWILIO_AUTH_TOKEN) return "Missing TWILIO_AUTH_TOKEN in backend .env";
  if (!process.env.TWILIO_PHONE_NUMBER) return "Missing TWILIO_PHONE_NUMBER in backend .env";
  return "";
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await OTP.findOne({
      email: normalizedEmail,
      purpose: "email",
    });

    if (existing && existing.expiresAt > new Date()) {
      return res.status(400).json({
        message: "OTP already sent. Wait 5 min",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email: normalizedEmail, purpose: "email" });

    await OTP.create({
      email: normalizedEmail,
      purpose: "email",
      otp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: normalizedEmail,
      subject: "OTP",
      text: `Your secure OTP for audio upload is ${otp}`,
    });

    res.json({ message: "OTP sent", expiresAt: Date.now() + OTP_TTL_MS });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const sendPhoneOTP = async (req, res) => {
  try {
    const twilioConfigError = getTwilioConfigError();
    if (twilioConfigError) {
      return res.status(500).json({ message: twilioConfigError });
    }

    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone || "");

    if (!normalizedPhone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    if (!isValidE164Phone(normalizedPhone)) {
      return res.status(400).json({
        message:
          "Phone must be in +countrycode format (example: +919876543210)",
      });
    }

    const existing = await OTP.findOne({
      phone: normalizedPhone,
      purpose: "profile-phone",
    });

    if (existing && existing.expiresAt > new Date()) {
      return res.status(400).json({
        message: "OTP already sent. Wait 5 min",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await OTP.deleteMany({ phone: normalizedPhone, purpose: "profile-phone" });
    await OTP.create({
      phone: normalizedPhone,
      purpose: "profile-phone",
      otp,
      expiresAt,
    });

    const client = createTwilioClient();
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
      body: `Your profile verification OTP is ${otp}. It expires in 5 minutes.`,
    });

    return res.status(200).json({
      message: "OTP sent to mobile number",
      phone: normalizedPhone,
      expiresAt: expiresAt.getTime(),
    });
  } catch (err) {
    return res.status(500).json({
      message: err?.message || "Failed to send OTP",
      code: err?.code || "TWILIO_SEND_FAILED",
    });
  }
};

export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const normalizedPhone = normalizePhone(phone || "");

    if (!normalizedPhone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const record = await OTP.findOne({
      phone: normalizedPhone,
      purpose: "profile-phone",
    });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    await OTP.deleteOne({ _id: record._id });

    return res.status(200).json({
      message: "Phone number verified",
      phone: normalizedPhone,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
