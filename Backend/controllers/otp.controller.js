import OTP from "../models/otp.model.js";
import nodemailer from "nodemailer";

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const existing = await OTP.findOne({ email });

    if (existing && existing.expiresAt > new Date()) {
      return res.status(400).json({
        message: "OTP already sent. Wait 5 min",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
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
      to: email,
      subject: "OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent", expiresAt: Date.now() + 5 * 60 * 1000 });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
