import AudioModel from "../models/audio.model.js";
import cloudinary from "../services/cloudinary.service.js";
import { getIndianTimeData } from "../services/subscription.service.js";

const isAudioUploadWindowOpenIST = () => {
  const { hour, minutes } = getIndianTimeData();
  const totalMinutes = hour * 60 + minutes;
  const startMinutes = 14 * 60; // 2:00 PM IST
  const endMinutes = 19 * 60; // 7:00 PM IST
  return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
};

export const uploadAudio = async (req, res) => {
  try {
    const file = req.file;
    const { duration, email } = req.body;

    if (!file) return res.status(400).json({ message: "No file" });

    if (!isAudioUploadWindowOpenIST()) {
      return res
        .status(403)
        .json({ message: "Audio upload allowed only 2:00 PM to 7:00 PM IST" });
    }

    if (Number(duration) > 300) {
      return res.status(400).json({ message: "Max 5 min" });
    }

    const base64 = file.buffer.toString("base64");

    const result = await cloudinary.uploader.upload(
      `data:audio/mp3;base64,${base64}`,
      {
        resource_type: "video",
        folder: "audio",
      },
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
