import {
  sendLanguageOTP,
  verifyLanguageOTP,
} from "../controllers/languageOtp.controller.js";

export default function languageOtpRoute(app) {
  // OTP Send
  app.post("/api/language-otp/send", sendLanguageOTP);
  // OTP Verify
  app.post("/api/language-otp/verify", verifyLanguageOTP);
  // OTP Send (Email)
  app.post("/api/language-otp/send-email", sendLanguageOTP);
  // OTP Verify (Email)
  app.post("/api/language-otp/verify-email", verifyLanguageOTP);
}
