import nodemailer from "nodemailer";
import twilio from "twilio";
import LanguageOTP from "../models/languageOtp.model.js";
import UserModel from "../models/user.model.js";

const OTP_TTL_MS = 5 * 60 * 1000;

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

const createTwilioClient = () =>
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const getTwilioConfigError = () => {
  if (!process.env.TWILIO_ACCOUNT_SID) return "Missing TWILIO_ACCOUNT_SID in backend .env";
  if (!process.env.TWILIO_AUTH_TOKEN) return "Missing TWILIO_AUTH_TOKEN in backend .env";
  if (!process.env.TWILIO_PHONE_NUMBER) return "Missing TWILIO_PHONE_NUMBER in backend .env";
  return "";
};

const normalizePhone = (input = "") => {
  const value = input.trim().replace(/[\s()-]/g, "");
  if (value.startsWith("00")) {
    return `+${value.slice(2)}`;
  }
  return value;
};

const isValidE164Phone = (phone = "") => /^\+[1-9]\d{7,14}$/.test(phone);

const getChannelForLanguage = (language) => (language === "fr" ? "email" : "sms");

export const sendLanguageOTP = async (req, res) => {
  try {
    const { email, language } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedLanguage = language?.trim().toLowerCase();

    if (!normalizedEmail || !normalizedLanguage) {
      return res.status(400).json({ message: "Email and language are required" });
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Registered user not found" });
    }

    const channel = getChannelForLanguage(normalizedLanguage);
    const normalizedPhone = normalizePhone(user.phone || "");

    if (channel === "sms" && !isValidE164Phone(normalizedPhone)) {
      return res.status(400).json({
        message:
          "Registered phone is invalid. Save number in +countrycode format (example: +919876543210).",
      });
    }

    const existing = await LanguageOTP.findOne({
      email: normalizedEmail,
      language: normalizedLanguage,
      channel,
    });

    if (existing && existing.expiresAt > new Date()) {
      return res.status(400).json({
        message: "OTP already sent. Wait 5 minutes before requesting again.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await LanguageOTP.deleteMany({
      email: normalizedEmail,
      language: normalizedLanguage,
      channel,
    });
    await LanguageOTP.create({
      email: normalizedEmail,
      phone: normalizedPhone,
      channel,
      otp,
      language: normalizedLanguage,
      expiresAt,
    });

    if (channel === "email") {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: normalizedEmail,
        subject: "Language Change OTP",
        text: `Use this OTP to confirm language switch to French: ${otp}. It expires in 5 minutes.`,
      });
    } else {
      const twilioConfigError = getTwilioConfigError();
      if (twilioConfigError) {
        return res.status(500).json({ message: twilioConfigError });
      }

      const client = createTwilioClient();
      await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: normalizedPhone,
        body: `Your language change OTP is ${otp}. It expires in 5 minutes.`,
      });
    }

    return res.status(200).json({
      message:
        channel === "email"
          ? "OTP sent to your registered email"
          : "OTP sent to your registered mobile number",
      channel,
      language: normalizedLanguage,
      expiresAt: expiresAt.getTime(),
      phone: channel === "sms" ? normalizedPhone : "",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyLanguageOTP = async (req, res) => {
  try {
    const { email, otp, language } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedLanguage = language?.trim().toLowerCase();

    if (!normalizedEmail || !otp || !normalizedLanguage) {
      return res
        .status(400)
        .json({ message: "Email, OTP and language are required" });
    }

    const channel = getChannelForLanguage(normalizedLanguage);

    const record = await LanguageOTP.findOne({
      email: normalizedEmail,
      language: normalizedLanguage,
      channel,
    });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await LanguageOTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    await LanguageOTP.deleteOne({ _id: record._id });
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { language: normalizedLanguage } },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Registered user not found" });
    }

    return res.status(200).json({
      message: "Language verified and updated",
      language: normalizedLanguage,
      channel,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
