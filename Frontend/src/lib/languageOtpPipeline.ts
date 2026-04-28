import axiosInstance from "./axiosInstance";

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
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to send or verify OTP."
  );
};

export const requestFrenchLanguageEmailOtp = async (email: string) => {
  await requestLanguageOtp(email, "fr");
};

export const verifyFrenchLanguageEmailOtp = async (
  email: string,
  otp: string,
) => {
  await verifyLanguageOtp(email, otp, "fr");
};

export const requestLanguageOtp = async (email: string, language: string) => {
  const res = await axiosInstance.post("/api/language-otp/send", {
    email,
    language,
  });
  return res.data;
};

export const verifyLanguageOtp = async (
  email: string,
  otp: string,
  language: string,
) => {
  const res = await axiosInstance.post("/api/language-otp/verify", {
    email,
    otp,
    language,
  });
  return res.data;
};

export const requestProfilePhoneOtp = async (phone: string) => {
  const res = await axiosInstance.post("/api/otp/phone/send", { phone });
  return res.data;
};

export const verifyProfilePhoneOtp = async (phone: string, otp: string) => {
  const res = await axiosInstance.post("/api/otp/phone/verify", {
    phone,
    otp,
  });
  return res.data;
};
