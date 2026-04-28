import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  purpose: { type: String, default: "email" },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const OTPModel = mongoose.model("OTP", otpSchema);

export default OTPModel;
