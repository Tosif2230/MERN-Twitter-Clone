import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import axiosInstance from "./axiosInstance";
import { phoneOtpAuth } from "../context/FireBase";

export const normalizeE164Phone = (input: string) => {
  const trimmed = input.trim().replace(/[\s()-]/g, "");
  if (trimmed.startsWith("00")) {
    return `+${trimmed.slice(2)}`;
  }
  return trimmed;
};

export const isValidE164Phone = (phone: string) =>
  /^\+[1-9]\d{7,14}$/.test(phone);

export const getPhoneOtpErrorMessage = (error: any) => {
  const code = error?.code || "";

  switch (code) {
    case "auth/invalid-phone-number":
      return "Invalid phone number. Use full format like +919876543210.";
    case "auth/too-many-requests":
      return "Too many OTP requests. Please wait before trying again.";
    case "auth/quota-exceeded":
      return "SMS quota exceeded in Firebase project. Try later or increase quota.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA failed. Refresh page and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication settings.";
    case "auth/invalid-app-credential":
      return "Invalid Firebase app credential. Check Firebase config and API key.";
    default:
      return (
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send or verify phone OTP."
      );
  }
};

export const requestFrenchLanguageEmailOtp = async (email: string) => {
  await axiosInstance.post("/api/language-otp/send-email", {
    email,
    language: "fr",
  });
};

export const verifyFrenchLanguageEmailOtp = async (
  email: string,
  otp: string,
) => {
  await axiosInstance.post("/api/language-otp/verify-email", {
    email,
    otp,
    language: "fr",
  });
};

export const createLanguagePhoneRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(phoneOtpAuth, containerId, {
    size: "invisible",
  });
};

export const requestLanguagePhoneOtp = async (
  phoneNumber: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> => {
  const normalizedPhone = normalizeE164Phone(phoneNumber);
  if (!isValidE164Phone(normalizedPhone)) {
    throw new Error("Phone must be in +countrycode format (example: +919876543210)");
  }

  await verifier.render();
  return signInWithPhoneNumber(phoneOtpAuth, normalizedPhone, verifier);
};

export const verifyLanguagePhoneOtp = async (
  confirmationResult: ConfirmationResult,
  otp: string,
) => {
  await confirmationResult.confirm(otp);
  await phoneOtpAuth.signOut();
};
