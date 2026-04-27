import {
  sendLanguageEmailOTP,
  verifyLanguageEmailOTP,
} from "../controllers/languageOtp.controller.js";

export default function languageOtpRoute(app) {
  app.post("/api/language-otp/send-email", sendLanguageEmailOTP);
  app.post("/api/language-otp/verify-email", verifyLanguageEmailOTP);
}
