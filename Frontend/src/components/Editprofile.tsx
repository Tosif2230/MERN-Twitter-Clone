import React, { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Camera, LinkIcon, MapPin, Phone, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import LoadingSpinner from "./Loading-spinner";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import {
  createLanguagePhoneRecaptcha,
  getPhoneOtpErrorMessage,
  isValidE164Phone,
  normalizeE164Phone,
  requestLanguagePhoneOtp,
  verifyLanguagePhoneOtp,
} from "../lib/languageOtpPipeline";

const Editprofile = ({ isOpen, onClose }: any) => {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    location: user?.location || t("profile.defaultLocation"),
    website: user?.website || t("profile.defaultWebsite"),
    avatar: user?.avatar || "",
    phone: user?.phone || "",
  });
  const [error, setError] = useState<any>({});
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [isPhoneOtpLoading, setIsPhoneOtpLoading] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(Boolean(user?.phone?.trim()));
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

  const phoneChanged = formData.phone.trim() !== (user?.phone || "").trim();

  const getPhoneRecaptcha = () => {
  if (recaptchaVerifierRef.current) {
    recaptchaVerifierRef.current.clear();
    recaptchaVerifierRef.current = null;
  }

  recaptchaVerifierRef.current = createLanguagePhoneRecaptcha(
    recaptchaContainerId
  );

  return recaptchaVerifierRef.current;
};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = t("editProfile.displayNameRequired");
    } else if (formData.displayName.length > 50) {
      newErrors.displayName = t("editProfile.displayNameLong");
    }

    if (formData.bio.length > 160) {
      newErrors.bio = t("editProfile.bioLong");
    }

    if (formData.website && formData.website.length > 100) {
      newErrors.website = t("editProfile.websiteLong");
    }

    if (formData.location && formData.location.length > 30) {
      newErrors.location = t("editProfile.locationLong");
    }

    const normalizedPhone = normalizeE164Phone(formData.phone);
    if (normalizedPhone && !isValidE164Phone(normalizedPhone)) {
      newErrors.phone = "Use a valid phone in +countrycode format";
    }

    if (phoneChanged && normalizedPhone && !isPhoneVerified) {
      newErrors.phone = "Verify phone number with OTP before saving";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    try {
      const normalizedPhone = normalizeE164Phone(formData.phone);
      await updateProfile({
        ...formData,
        phone: normalizedPhone,
      });
      toast.success(t("editProfile.profileUpdated"));
      onClose();
    } catch {
      toast.error(t("editProfile.profileFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "phone") {
      const isSameAsStored = value.trim() === (user?.phone || "").trim();
      setIsPhoneVerified(isSameAsStored && value.trim().length > 0);
      setIsPhoneOtpSent(false);
      setPhoneOtp("");
      setPhoneConfirmation(null);
    }
    if (error[field]) {
      setError((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSendPhoneOtp = async () => {
    const normalizedPhone = normalizeE164Phone(formData.phone);
    if (!normalizedPhone) {
      toast.error("Please enter phone number");
      return;
    }

    if (!isValidE164Phone(normalizedPhone)) {
      toast.error("Phone must be in +countrycode format (example: +919876543210)");
      return;
    }

    setIsPhoneOtpLoading(true);
    try {
      const verifier = getPhoneRecaptcha();
      const confirmation = await requestLanguagePhoneOtp(normalizedPhone, verifier);
      setFormData((prev) => ({ ...prev, phone: normalizedPhone }));
      setPhoneConfirmation(confirmation);
      setIsPhoneOtpSent(true);
      setIsPhoneVerified(false);
      toast.success("OTP sent to mobile number");
    } catch (otpError: any) {
      toast.error(getPhoneOtpErrorMessage(otpError));
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    } finally {
      setIsPhoneOtpLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneConfirmation) {
      toast.error("Send OTP first");
      return;
    }

    if (!phoneOtp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    setIsPhoneOtpLoading(true);
    try {
      await verifyLanguagePhoneOtp(phoneConfirmation, phoneOtp.trim());
      setIsPhoneVerified(true);
      setIsPhoneOtpSent(false);
      setPhoneOtp("");
      setPhoneConfirmation(null);
      toast.success("Phone number verified");
    } catch (otpError: any) {
      toast.error(getPhoneOtpErrorMessage(otpError));
    } finally {
      setIsPhoneOtpLoading(false);
    }
  };

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
        setFormData((prev) => ({ ...prev, avatar: url }));
      }
    } catch (error) {
      console.log(error);
      toast.error(t("editProfile.imageFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 sm:p-4">
      <Card className="h-[100dvh] w-full max-w-2xl overflow-y-auto rounded-none border-gray-800 bg-black text-white sm:h-auto sm:max-h-[90vh] sm:rounded-xl">
        <CardHeader className="relative pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black hover:bg-gray-900"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </Button>
              <CardTitle className="truncate text-base sm:text-xl">{t("editProfile.title")}</CardTitle>
            </div>
            <Button
              type="submit"
              form="edit-profile-form"
              className="rounded-full bg-white px-4 text-xs font-semibold text-black hover:bg-gray-200 sm:px-6 sm:text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>{t("editProfile.saving")}</span>
                </div>
              ) : (
                t("editProfile.save")
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error.general && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm m-4">
              {error.general}
            </div>
          )}

          <form id="edit-profile-form" onSubmit={handleSubmit}>
            {/* Cover photo */}
            <div className="relative">
              <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90"
                  disabled={isLoading}
                >
                  <Camera className="h-6 w-6 text-white" />
                </Button>
              </div>

              {/* Profile Picture */}
              <div className="absolute -bottom-12 left-3 sm:-bottom-16 sm:left-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-black">
                    <AvatarImage src={user?.avatar} alt={user?.displayName} />
                    <AvatarFallback className="text-2xl">
                      {user?.displayName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <input
                    type="file"
                    accept="image/*"
                    id="avatarUpload"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90"
                    disabled={isLoading}
                    onClick={() =>
                      document.getElementById("avatarUpload")?.click()
                    }
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 mt-12 sm:mt-16 space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-white">
                  {t("editProfile.name")}
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                 placeholder={t("editProfile.namePlaceholder")}
                  maxLength={50}
                  disabled={isLoading}
                />
                <div className="flex justify-between text-sm">
                  {error.displayName && (
                    <p className="text-red-400">{error.displayName}</p>
                  )}
                  <p className="text-gray-400 ml-auto">
                    {formData.displayName.length}
                  </p>
                </div>
              </div>
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">
                  {t("editProfile.bio")}
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 resize-none min-h-[100px]"
                   placeholder={t("editProfile.bioPlaceholder")}
                  maxLength={160}
                  disabled={isLoading}
                />
                <div className="flex justify-between text-sm">
                  {error.bio && <p className="text-red-400">{error.bio}</p>}
                  <p className="text-gray-400 ml-auto">{formData.bio.length}/160  </p>
                </div>
              </div>
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">
                  {t("editProfile.location")}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder={t("editProfile.locationPlaceholder")}
                    maxLength={30}
                    className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  {error.location && (
                    <p className="text-red-400">{error.location}</p>
                  )}
                  <p className="text-gray-400 ml-auto">
                    {formData.location.length}
                  </p>
                </div>
              </div>
              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="text-white">
                  {t("editProfile.website")}
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="website"
                    type="text"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    placeholder={t("editProfile.websitePlaceholder")}
                    maxLength={100}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  {error.website && (
                    <p className="text-red-400">{error.website}</p>
                  )}
                  <p className="text-gray-400 ml-auto">
                    {formData.website.length}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  {t("auth.phone")}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    placeholder="Enter Your Phone No. With country Code"
                    disabled={isLoading || isPhoneOtpLoading}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-600 bg-transparent text-white hover:bg-stone-800 hover:text-white"
                    onClick={handleSendPhoneOtp}
                    disabled={
                      isLoading ||
                      isPhoneOtpLoading ||
                      !formData.phone.trim() ||
                      (!phoneChanged && !!user.phone?.trim())
                    }
                  >
                    {isPhoneOtpLoading ? t("editProfile.saving") : "Send OTP"}
                  </Button>
                  {isPhoneVerified && (
                    <span className="text-sm text-green-400">Verified</span>
                  )}
                </div>
                {isPhoneOtpSent && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Input
                      type="text"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      placeholder={t("composer.enterOtp")}
                      disabled={isLoading || isPhoneOtpLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-600 bg-transparent text-white hover:bg-stone-800 hover:text-white"
                      onClick={handleVerifyPhoneOtp}
                      disabled={isLoading || isPhoneOtpLoading || !phoneOtp.trim()}
                    >
                      {t("composer.verifyOtp")}
                    </Button>
                  </div>
                )}
                {error.phone && <p className="text-red-400 text-sm">{error.phone}</p>}
              </div>
            </div>
          </form>
          <div id={recaptchaContainerId}></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Editprofile;
