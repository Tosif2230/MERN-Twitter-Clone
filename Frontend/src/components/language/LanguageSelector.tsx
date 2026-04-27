"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { toast } from "react-toastify";

import { cn } from "@/src/lib/utils";
import {
  createLanguagePhoneRecaptcha,
  getPhoneOtpErrorMessage,
  isValidE164Phone,
  normalizeE164Phone,
  requestFrenchLanguageEmailOtp,
  requestLanguagePhoneOtp,
  verifyFrenchLanguageEmailOtp,
  verifyLanguagePhoneOtp,
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
}

interface StoredUser {
  email?: string;
  phone?: string;
}

export default function LanguageSelector({
  className,
  type = "default",
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
  const [phoneConfirmation, setPhoneConfirmation] =
    useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerId = useId().replace(/:/g, "_");

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const selectedLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const selectedLanguageLabel =
    languages.find((language) => language.code === selectedLanguage)?.label ||
    t("languageSelector.placeholder");

  const applyLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const getPhoneRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }

    recaptchaVerifierRef.current =
      createLanguagePhoneRecaptcha(recaptchaContainerId);

    return recaptchaVerifierRef.current;
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
    setPhoneConfirmation(null);
  };

  const closeOtpDialogManually = () => {
    resetOtpState();
    toast.info("Language change cancelled");
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
  };

  const handleVerifyOtp = async () => {
    const otp = otpValue.trim();
    if (!otp || !pendingLanguage || !otpMode) {
      toast.error("Please enter OTP");
      return;
    }

    setIsOtpSubmitting(true);
    try {
      if (otpMode === "email") {
        await verifyFrenchLanguageEmailOtp(pendingEmail, otp);
      } else {
        if (!phoneConfirmation) {
          toast.error("Send OTP first");
          return;
        }
        await verifyLanguagePhoneOtp(phoneConfirmation, otp);
      }

      await applyLanguage(pendingLanguage);
      toast.success("Language updated successfully");
      resetOtpState();
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    } catch (error: any) {
      toast.error(getPhoneOtpErrorMessage(error));
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const handleChange = async (lang: string) => {
    if (lang === selectedLanguage || isVerifyingLanguage) return;

    const user = getStoredUser();
    if (!user) {
      toast.error("Please login first to change language");
      return;
    }

    setIsVerifyingLanguage(true);

    try {
      if (lang === "fr") {
        if (!user.email) {
          toast.error("Registered email is required for French language");
          return;
        }

        await requestFrenchLanguageEmailOtp(user.email);
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

      const verifier = getPhoneRecaptcha();
      const confirmationResult = await requestLanguagePhoneOtp(
        normalizedPhone,
        verifier,
      );
      toast.success("OTP sent to your registered mobile number");
      setOtpMode("phone");
      setPendingLanguage(lang);
      setPendingPhone(normalizedPhone);
      setPhoneConfirmation(confirmationResult);
      setOtpValue("");
      setOtpDialogOpen(true);
    } catch (error: any) {
      toast.error(getPhoneOtpErrorMessage(error));
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
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
        <div id={recaptchaContainerId}></div>
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
      <div id={recaptchaContainerId}></div>
      {otpDialog}
    </DropdownMenu>
  );
}
