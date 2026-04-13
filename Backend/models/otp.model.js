import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Date,
});

const OTPModel = mongoose.model("OTP", otpSchema);

export default OTPModel;
