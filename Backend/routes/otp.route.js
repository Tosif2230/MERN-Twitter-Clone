import { sendOTP } from "../controllers/otp.controller.js";

export default function otpRoute(app) {
  //Regester
  app.post("/api/otp/send", sendOTP);
}
