"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/src/context/FireBase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import TwitterLogo from "../TwitterLogo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
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
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm sm:text-base"
          />

          <Button
            onClick={handleReset}
            className="w-full text-sm sm:text-base py-2 sm:py-3"
          >
            Reset Password
          </Button>

          {message && (
            <p className="text-green-500 text-xs sm:text-sm text-center">
              {message}
            </p>
          )}

          {error && (
            <p className="text-red-500 text-xs sm:text-sm text-center">
              {error}
            </p>
          )}

          <Button
            variant="outline"
            className="w-full bg-black text-sm sm:text-base"
            onClick={() => router.push("/")}
          >
            ← Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;