import AudioModel from "../models/audio.model.js";
import cloudinary from "../services/cloudinary.service.js";

export const uploadAudio = async (req, res) => {
  try {
    const file = req.file;
    const { duration, email } = req.body;

    if (!file) return res.status(400).json({ message: "No file" });

    const hour = new Date().getHours();
    if (hour < 14 || hour > 19) {
      return res.status(403).json({ message: "2PM–7PM only" });
    }

    if (Number(duration) > 300) {
      return res.status(400).json({ message: "Max 5 min" });
    }

    const base64 = file.buffer.toString("base64");

    const result = await cloudinary.uploader.upload(
      `data:audio/mp3;base64,${base64}`,
      {
        resource_type: "video", // audio = video type
        folder: "audio",
      }
    );

    await AudioModel.create({
      url: result.secure_url,
      userEmail: email,
      duration: Number(duration),
    });

    res.json({
      audioUrl: result.secure_url,
    });

  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};