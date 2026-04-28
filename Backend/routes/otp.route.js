import { sendOTP, sendPhoneOTP, verifyPhoneOTP } from "../controllers/otp.controller.js";

export default function otpRoute(app) {
  //Send OTP 
  app.post("/api/otp/send", sendOTP);
  // Send Phone OTP
  app.post("/api/otp/phone/send", sendPhoneOTP);
  //Verify Phone OTP
  app.post("/api/otp/phone/verify", verifyPhoneOTP);
}
