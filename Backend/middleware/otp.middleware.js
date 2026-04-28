import OTP from "../models/otp.model.js";

export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();
  const record = await OTP.findOne({ email: normalizedEmail, purpose: "email" });

  if (!record) return res.status(400).json({ message: "OTP not found" });

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  await OTP.deleteOne({ _id: record._id });

  next();
};
