"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/src/context/FireBase";
import { useRouter } from "next/navigation";
import { Copy, Home, Lock, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import TwitterLogo from "../TwitterLogo";
import axiosInstance from "@/src/lib/axiosInstance";
import { toast } from "react-toastify";

type RecoveryMethod = "email" | "phone";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateLetterPassword = (length = 12) => {
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values, (value) => letters[value % letters.length]).join(
    "",
  );
};

const ForgotPassword = () => {
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      toast.error(
        recoveryMethod === "email"
          ? "Please enter your email"
          : "Please enter your phone number",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post("/api/forgot-password", {
        [recoveryMethod]: trimmedIdentifier,
      });

      if (res.data.message === "Allowed to reset your PASSWORD") {
        await sendPasswordResetEmail(auth, res.data.resetEmail);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePassword = () => {
    const password = generateLetterPassword();
    setGeneratedPassword(password);
    toast.success("Generated a letters-only password");
  };

  const handleCopyPassword = async () => {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    toast.success("Password copied");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-black border-gray-800 text-white shadow-xl rounded-2xl">
        <CardHeader className="pb-2">
          <div className="mb-3 flex justify-center">
            <TwitterLogo size="lg" className="text-white sm:size-xl" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-400">
            Forgot Password
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={recoveryMethod === "email" ? "default" : "outline"}
              className={
                recoveryMethod === "email" ? "w-full" : "w-full bg-black"
              }
              onClick={() => {
                setRecoveryMethod("email");
                setIdentifier("");
              }}
            >
              Email <Mail />
            </Button>
            <Button
              type="button"
              variant={recoveryMethod === "phone" ? "default" : "outline"}
              className={
                recoveryMethod === "phone" ? "w-full" : "w-full bg-black"
              }
              onClick={() => {
                setRecoveryMethod("phone");
                setIdentifier("");
              }}
            >
              Phone <Phone />
            </Button>
          </div>

          <Input
            type={recoveryMethod === "email" ? "email" : "tel"}
            placeholder={
              recoveryMethod === "email"
                ? "Enter your registered email"
                : "Enter your registered phone number"
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="text-sm sm:text-base"
          />

          <Button
            onClick={handleReset}
            className="w-full text-sm sm:text-base py-2 sm:py-3"
            disabled={!identifier.trim() || isSubmitting}
          >
            {isSubmitting ? "Sending reset link..." : "Reset Password"}
          </Button>

          <div className="rounded-lg border border-gray-800 p-3 space-y-3">
            <p className="text-sm text-gray-400">
              Need a simple new password? Generate one with letters only.
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={generatedPassword}
                placeholder="Generated password"
                className="text-sm sm:text-base"
              />
              <Button
                type="button"
                variant="outline"
                className="bg-black"
                onClick={handleCopyPassword}
                disabled={!generatedPassword}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-black text-sm sm:text-base"
              onClick={handleGeneratePassword}
            >
              Generate Password <Lock />
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full bg-black text-sm sm:text-base"
            onClick={() => router.push("/")}
          >
            ← Back to <Home />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
