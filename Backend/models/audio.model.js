import mongoose from "mongoose";

const audioSchema = new mongoose.Schema({
  url: { type: String, required: true },
  userEmail: { type: String, required: true },
  duration: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const AudioModel = mongoose.model("Audio", audioSchema);

export default AudioModel;
