import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  BarChart3,
  Calendar,
  Globe,
  Image,
  MapPin,
  Mic,
  Smile,
} from "lucide-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import { Label } from "./ui/label";
import axiosInstance from "../lib/axiosInstance";
import { db } from "../context/FireBase";
import { addDoc, collection } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "react-toastify";

const TweetComposer = ({ onTweetposted }: any) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageurl, setImageurl] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isAudioUploaded, setIsAudioUploaded] = useState(false);

  const maxLength = 200;
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    console.log("FINAL AUDIO:", audioUrl);

    if (!user || !content.trim()) return;

    if (pendingAudio && !audioUrl) {
      toast.warning("Upload audio first");
      return;
    }

    setIsLoading(true);
    try {
      const tweetData = {
        author: user?._id,
        content,
        image: imageurl,
        audio: audioUrl || null,
      };
      const res = await toast.promise(
        axiosInstance.post("/api/post", tweetData),
        {
          pending: "Posting tweet...",
          success: "Tweet posted successfully",
          error: "Failed to post tweet",
        },
      );

      await addDoc(collection(db, "tweets"), {
        content: res.data.content,
        hasKeyword: res.data.hasKeyword ?? false,
        createdAt: new Date(),
      });
      onTweetposted(res.data);
      setContent("");
      setImageurl("");
      setAudioUrl("");
      setIsAudioUploaded(false);
    } catch (error) {
      toast.error("Failed to post tweet");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;
  if (!user) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);

    const image = e.target.files[0];
    const formdataImg = new FormData();
    formdataImg.set("image", image);
    try {
      const res = await axios.post(
        "https://api.imgbb.com/1/upload?key=3df9bb862f57d1690d86189e27aae659",
        formdataImg,
      );
      const url = res.data.data.display_url;
      if (url) {
        setImageurl(url);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAudioUpload = async (e: any) => {
    try {
      setIsLoading(true);

      const file = e.target.files[0];
      if (!file) return;

      // Time check
      const hour = new Date().getHours();
      if (hour <= 14 || hour >= 19) {
        toast.error("Audio upload allowed only 2PM–7PM");
        setIsLoading(false);
        return;
      }

      // File Size check
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Max 100MB allowed");
        return;
      }

      const url = URL.createObjectURL(file);
      const audio = new Audio(url);

      audio.onloadedmetadata = async () => {
        URL.revokeObjectURL(url);
        try {
          // Duration check
          if (audio.duration > 300) {
            toast.error("Max 5 minutes");
            return;
          }

          // Send OTP
          const res = await axiosInstance.post("/api/otp/send", {
            email: user.email,
          });
          toast.success("OTP sent to your email");

          setPendingAudio({ file, duration: audio.duration });
          setShowOtpModal(true);
        } catch (error: any) {
          console.log("OTP ERROR:", error.response?.data);
          toast.error(error.response?.data?.message || "OTP send failed");
        } finally {
          setIsLoading(false);
        }
      };
    } catch (error) {
      console.error("Error handling audio upload:", error);
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };
  const handleVerifyAndUpload = async () => {
    if (!pendingAudio) return;

    try {
      const formData = new FormData();
      formData.append("audio", pendingAudio.file);
      formData.append("duration", pendingAudio.duration.toString());
      formData.append("email", user.email);
      formData.append("otp", otp);

      const res = await toast.promise(
        axiosInstance.post("/api/audio/upload-audio", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
        {
          pending: "Uploading audio...",
          success: "Audio uploaded successfully",
          error: "Upload failed",
        },
      );

      setAudioUrl(res.data.audioUrl);
      setIsAudioUploaded(true);
      setShowOtpModal(false);
      setOtp("");
      setPendingAudio(null);
    } catch (error: any) {
      console.log("UPLOAD ERROR:", error.response?.data);
      toast.error(error.response?.data?.message || "Upload failed");
    }
  };
  return (
    <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none">
      <CardContent className="p-4">
        <div className="flex space-x-3 sm:space-x-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>{user.displayName}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full max-w-full break-words whitespace-pre-wrap overflow-hidden bg-transparent border-none text-base sm:text-xl text-white resize-none min-h-10 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-base sm:placeholder:text-xl placeholder-gray-500"
              />

              <div className="flex items-center gap-2 border-b border-gray-600 py-2 px-1 sm:px-2">
                <Globe className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-semibold">
                  Everyone can reply
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
                <div className="flex items-center gap-1 sm:gap-3 text-blue-400 flex-wrap">
                  <Label
                    htmlFor="tweetImage"
                    className="p-2 rounded-full hover:bg-blue-900/20 cursor-pointer"
                  >
                    <Image className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      id="tweetImage"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isLoading}
                    />
                  </Label>
                  <Label
                    htmlFor="tweetAudio"
                    className="p-2 rounded-full hover:bg-blue-900/20 cursor-pointer"
                  >
                    <Mic className="h-5 w-5" />
                    <input
                      type="file"
                      accept="audio/*"
                      id="tweetAudio"
                      className="hidden"
                      onChange={handleAudioUpload}
                    />
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20"
                  >
                    <BarChart3 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20"
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {characterCount > 0 && (
                      <div className="flex items-center space-x-2 ">
                        <div className="relative w-8 h-8">
                          <svg className="w-8 h-8 transform -rotate-90">
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              className="text-gray-700"
                            />
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 14}`}
                              strokeDashoffset={`${
                                2 *
                                Math.PI *
                                14 *
                                (1 - characterCount / maxLength)
                              }`}
                              className={
                                isOverLimit
                                  ? "text-red-500"
                                  : isNearLimit
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                              }
                            />
                          </svg>
                        </div>
                        {isNearLimit && (
                          <span
                            className={`text-sm ${
                              isOverLimit ? "text-red-500" : "text-yellow-500"
                            }`}
                          >
                            {maxLength - characterCount}
                          </span>
                        )}
                      </div>
                    )}
                    <Separator
                      orientation="vertical"
                      className="h-6 bg-gray-700 hidden sm:block"
                    />
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base"
                      disabled={
                        !content.trim() ||
                        isOverLimit ||
                        isLoading ||
                        (pendingAudio && !isAudioUploaded)
                      }
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="bg-black text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="p-2 rounded bg-gray-900 border border-gray-700 text-white outline-none"
              maxLength={6}
            />
            <Button
              onClick={handleVerifyAndUpload}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Verify & Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TweetComposer;
