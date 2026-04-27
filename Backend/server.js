import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoute from "./routes/auth.route.js";
import tweetRoute from "./routes/tweet.route.js"
import audioRoute from "./routes/audio.route.js";
import otpRoute from "./routes/otp.route.js";
import languageOtpRoute from "./routes/languageOtp.route.js";
import subscriptionRoute from "./routes/subscription.route.js";
import { configureCloudinary } from "./services/cloudinary.service.js";

const app = express();
const corsOptions = {
  origin: '*', // Allow from anywhere
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Explicitly allow PATCH
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Twiter Clone - Backend");
});

authRoute(app);
tweetRoute(app);
otpRoute(app)
languageOtpRoute(app);
audioRoute(app)
subscriptionRoute(app)
const port = process.env.PORT || 5000;
const url = process.env.MONGODB_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("DB Connected Successfully");
    configureCloudinary();
    app.listen(port, () => {
      console.log(`Server connects on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("error", error.message);
  });
