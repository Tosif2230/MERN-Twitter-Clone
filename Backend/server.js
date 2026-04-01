import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.route.js";
import tweetRoute from "./routes/tweet.route.js"

dotenv.config();
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
const port = process.env.PORT || 5000;
const url = process.env.MONGODB_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("DB Connected Successfully");
    app.listen(port, () => {
      console.log(`Server connects on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("error", error.message);
  });
