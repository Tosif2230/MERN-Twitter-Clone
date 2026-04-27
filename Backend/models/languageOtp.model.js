import mongoose from "mongoose";

const languageOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  language: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const LanguageOTPModel = mongoose.model("LanguageOTP", languageOtpSchema);

export default LanguageOTPModel;
