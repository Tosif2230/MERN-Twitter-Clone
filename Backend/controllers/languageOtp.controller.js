import nodemailer from "nodemailer";
import LanguageOTP from "../models/languageOtp.model.js";
import UserModel from "../models/user.model.js";

const OTP_TTL_MS = 1 * 60 * 1000;

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

export const sendLanguageEmailOTP = async (req, res) => {
  try {
    const { email, language } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !language) {
      return res.status(400).json({ message: "Email and language are required" });
    }

    if (language !== "fr") {
      return res.status(400).json({ message: "Email OTP is only allowed for French" });
    }

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Registered user not found" });
    }

    const existing = await LanguageOTP.findOne({ email: normalizedEmail });
    if (existing && existing.expiresAt > new Date()) {
      return res.status(400).json({
        message: "OTP already sent. Wait 1 min",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await LanguageOTP.deleteMany({ email: normalizedEmail });
    await LanguageOTP.create({
      email: normalizedEmail,
      otp,
      language,
      expiresAt,
    });

    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: normalizedEmail,
      subject: "Language Change OTP",
      text: `Use this OTP to confirm language switch to French: ${otp}. It expires in 5 minutes.`,
    });

    return res.status(200).json({
      message: "Language OTP sent",
      expiresAt: expiresAt.getTime(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyLanguageEmailOTP = async (req, res) => {
  try {
    const { email, otp, language } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !otp || !language) {
      return res
        .status(400)
        .json({ message: "Email, OTP and language are required" });
    }

    const record = await LanguageOTP.findOne({ email: normalizedEmail });
    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.otp !== otp || record.language !== language) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await LanguageOTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    await LanguageOTP.deleteOne({ _id: record._id });
    return res.status(200).json({ message: "Language OTP verified" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
