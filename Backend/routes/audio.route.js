import { upload } from "../middleware/upload.middleware.js";
import { verifyOTP } from "../middleware/otp.middleware.js";
import { uploadAudio } from "../controllers/audio.controller.js";

export default function audioRoute(app) {
  //Regester
  app.post("/api/audio/upload-audio", upload.single("audio"), verifyOTP, uploadAudio);
}
