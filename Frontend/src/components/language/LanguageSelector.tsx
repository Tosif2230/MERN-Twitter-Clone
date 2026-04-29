"use client";

import { useState } from "react";
import { ChevronDown, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { cn } from "@/src/lib/utils";
import {
  getPhoneOtpErrorMessage,
  isValidE164Phone,
  normalizeE164Phone,
  requestLanguageOtp,
  verifyLanguageOtp,
} from "@/src/lib/languageOtpPipeline";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Espanol" },
  { code: "pt", label: "Portugues" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "Francais" },
];

interface LanguageSelectorProps {
  className?: string;
  type?: "default" | "dropdownMenu";
  requireVerification?: boolean;
}

interface StoredUser {
  email?: string;
  phone?: string;
}

export default function LanguageSelector({
  className,
  type = "default",
  requireVerification = true,
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isVerifyingLanguage, setIsVerifyingLanguage] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpMode, setOtpMode] = useState<"email" | "phone" | null>(null);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const selectedLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const selectedLanguageLabel =
    languages.find((language) => language.code === selectedLanguage)?.label ||
    t("languageSelector.placeholder");

  const applyLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const getStoredUser = (): StoredUser | null => {
    if (typeof window === "undefined") return null;

    const rawUser = localStorage.getItem("twitter-user");
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as StoredUser;
    } catch {
      return null;
    }
  };

  const resetOtpState = () => {
    setOtpDialogOpen(false);
    setOtpValue("");
    setOtpMode(null);
    setPendingLanguage(null);
    setPendingEmail("");
    setPendingPhone("");
  };

  const closeOtpDialogManually = () => {
    resetOtpState();
    toast.info("Language change cancelled");
  };

  const handleVerifyOtp = async () => {
    const otp = otpValue.trim();
    if (!otp || !pendingLanguage || !otpMode) {
      toast.error("Please enter OTP");
      return;
    }

    setIsOtpSubmitting(true);
    try {
      const verifyResponse = await verifyLanguageOtp(
        pendingEmail,
        otp,
        pendingLanguage,
      );
      if (verifyResponse?.user) {
        localStorage.setItem("twitter-user", JSON.stringify(verifyResponse.user));
      }

      await applyLanguage(pendingLanguage);
      toast.success("Language updated successfully");
      resetOtpState();
    } catch (error: any) {
      toast.error(getPhoneOtpErrorMessage(error));
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const handleChange = async (lang: string) => {
    if (lang === selectedLanguage || isVerifyingLanguage) return;

    if (!requireVerification) {
      await applyLanguage(lang);
      return;
    }

    const user = getStoredUser();
    if (!user) {
      toast.error("Please login first to change language");
      return;
    }

    setIsVerifyingLanguage(true);

    try {
      if (!user.email) {
        toast.error("Registered email is required to change language");
        return;
      }

      if (lang === "fr") {
        await requestLanguageOtp(user.email, lang);
        toast.success("OTP sent to your registered email");

        setOtpMode("email");
        setPendingLanguage(lang);
        setPendingEmail(user.email);
        setOtpValue("");
        setOtpDialogOpen(true);
        return;
      }

      if (!user.phone?.trim()) {
        toast.error("Registered phone number is required for this language");
        return;
      }

      const normalizedPhone = normalizeE164Phone(user.phone);
      if (!isValidE164Phone(normalizedPhone)) {
        toast.error("Saved phone number must be in +countrycode format (example: +919876543210)");
        return;
      }

      const otpResponse = await requestLanguageOtp(user.email, lang);
      toast.success("OTP sent to your registered mobile number");
      setOtpMode("phone");
      setPendingLanguage(lang);
      setPendingEmail(user.email);
      setPendingPhone(otpResponse?.phone || normalizedPhone);
      setOtpValue("");
      setOtpDialogOpen(true);
    } catch (error: any) {
      toast.error(getPhoneOtpErrorMessage(error));
    } finally {
      setIsVerifyingLanguage(false);
    }
  };

  const languageItems = (
    <DropdownMenuRadioGroup
      value={selectedLanguage}
      onValueChange={handleChange}
    >
      {languages.map((language) => (
        <DropdownMenuRadioItem
          key={language.code}
          value={language.code}
          onSelect={(event) => event.preventDefault()}
          className="cursor-pointer text-white focus:bg-gray-900 focus:text-white"
        >
          {language.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );

  const pendingLanguageLabel =
    languages.find((language) => language.code === pendingLanguage)?.label ||
    pendingLanguage;

  const otpDialog = (
    <Dialog
      open={otpDialogOpen}
      onOpenChange={(open) => {
        if (open) setOtpDialogOpen(true);
      }}
    >
      <DialogContent
        className="border border-gray-800 bg-black text-white"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {otpMode === "email" ? "Verify Email OTP" : "Verify Mobile OTP"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {otpMode === "email"
              ? `Enter email OTP to switch language to ${pendingLanguageLabel}.`
              : `Enter mobile OTP sent to ${pendingPhone} to switch language to ${pendingLanguageLabel}.`}
          </DialogDescription>
        </DialogHeader>
        <Input
          value={otpValue}
          onChange={(e) => setOtpValue(e.target.value)}
          placeholder="Enter OTP"
          className="border-gray-700 bg-black text-white placeholder:text-gray-500"
        />
        <DialogFooter className="border-t border-gray-800 bg-black/40">
          <Button
            type="button"
            variant="outline"
            className="border-gray-700 bg-transparent text-white hover:bg-gray-900 hover:text-white"
            onClick={closeOtpDialogManually}
            disabled={isOtpSubmitting}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleVerifyOtp}
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={isOtpSubmitting || !otpValue.trim()}
          >
            {isOtpSubmitting ? "Verifying..." : "Verify OTP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (type === "dropdownMenu") {
    return (
      <>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={cn("w-full cursor-pointer text-white", className)}
          >
            <Languages className="h-4 w-4" />
            <span className="mx-2">{t("languageLabel")}</span>
            <span className="ml-auto text-xs text-gray-400">
              {selectedLanguageLabel}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44 border-gray-800 bg-black text-white">
            {languageItems}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {otpDialog}
      </>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-auto gap-2 border-none px-2 py-1 text-sm font-normal",
            className,
          )}
          aria-label={t("languageLabel")}
        >
          <Languages className="h-4 w-4" />
          <span>{selectedLanguageLabel}</span>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="min-w-36 border-gray-800  bg-black text-white"
      >
        {languageItems}
      </DropdownMenuContent>
      {otpDialog}
    </DropdownMenu>
  );
}
