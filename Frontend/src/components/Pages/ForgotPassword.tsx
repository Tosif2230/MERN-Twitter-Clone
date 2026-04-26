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
import { useTranslation } from "react-i18next";
import LanguageSelector from "../language/LanguageSelector";

type RecoveryMethod = "email" | "phone";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateLetterPassword = (length = 12) => {
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values, (value) => letters[value % letters.length]).join("");
};

const ForgotPassword = () => {
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleReset = async () => {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      toast.error(
        recoveryMethod === "email"
          ? t("forgotPassword.enterEmail")
          : t("forgotPassword.enterPhone"),
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
        toast.success(t("forgotPassword.resetSent"));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("forgotPassword.wrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePassword = () => {
    const password = generateLetterPassword();
    setGeneratedPassword(password);
    toast.success(t("forgotPassword.generated"));
  };

  const handleCopyPassword = async () => {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    toast.success(t("forgotPassword.copied"));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-black border-gray-800 text-white shadow-xl rounded-2xl">
        <CardHeader className="pb-2">
          <div className="mb-4 flex justify-end">
            <LanguageSelector className="w-48 border-gray-700 bg-black text-white" />
          </div>
          <div className="mb-3 flex justify-center">
            <TwitterLogo size="lg" className="text-white sm:size-xl" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-400">
            {t("forgotPassword.title")}
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
              {t("forgotPassword.email")} <Mail />
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
              {t("forgotPassword.phone")} <Phone />
            </Button>
          </div>

          <Input
            type={recoveryMethod === "email" ? "email" : "tel"}
            placeholder={
              recoveryMethod === "email"
                ? t("forgotPassword.emailPlaceholder")
                : t("forgotPassword.phonePlaceholder")
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
            {isSubmitting ? t("forgotPassword.sending") : t("forgotPassword.reset")}
          </Button>

          <div className="rounded-lg border border-gray-800 p-3 space-y-3">
            <p className="text-sm text-gray-400">
              {t("forgotPassword.simplePassword")}
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={generatedPassword}
                placeholder={t("forgotPassword.generatedPlaceholder")}
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
              {t("forgotPassword.generate")} <Lock />
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full bg-black text-sm sm:text-base"
            onClick={() => router.push("/")}
          >
            {t("forgotPassword.back")} <Home />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
