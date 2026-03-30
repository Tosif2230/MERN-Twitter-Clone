import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Twiter Clone Backend");
});

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

