import UserModel from "../models/user.model.js";
import { UAParser } from "ua-parser-js";

const getDeviceCategory = (deviceType) => {
  if (["mobile", "tablet", "wearable"].includes(deviceType)) return "mobile";
  if (["console", "smarttv", "embedded"].includes(deviceType)) return "desktop";
  return "desktop";
};

const getIpAddress = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0];

  return (
    ip?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.ip ||
    "Unknown IP"
  );
};

const buildLoginHistoryEntry = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    browser: browser.name || "Unknown browser",
    operatingSystem: os.name || "Unknown OS",
    deviceCategory: getDeviceCategory(device.type),
    ipAddress: getIpAddress(req),
    loggedInAt: new Date(),
  };
};

const appendLoginHistory = async (user, req) => {
  const loginEntry = buildLoginHistoryEntry(req);
  const lastLogin = user.loginHistory?.[0];
  const isDuplicateRecentLogin =
    lastLogin &&
    lastLogin.browser === loginEntry.browser &&
    lastLogin.operatingSystem === loginEntry.operatingSystem &&
    lastLogin.deviceCategory === loginEntry.deviceCategory &&
    lastLogin.ipAddress === loginEntry.ipAddress &&
    Math.abs(new Date(lastLogin.loggedInAt).getTime() - loginEntry.loggedInAt.getTime()) <
      10000;

  if (isDuplicateRecentLogin) {
    return user;
  }

  user.loginHistory = [loginEntry, ...(user.loginHistory || [])].slice(0, 25);
  await user.save();
  return user;
};

//Regester
export async function registerUser(req, res) {
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send(existingUser);
    }
    const joinedDate = new Date();
    const expiresAt = new Date(joinedDate);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const newUser = new UserModel({
      ...req.body,
      subscriptionPlan: req.body.subscriptionPlan || "Free",
      subscriptionPrice: req.body.subscriptionPrice || 0,
      subscriptionDate: req.body.subscriptionDate || joinedDate,
      subscriptionExpiresAt: req.body.subscriptionExpiresAt || expiresAt,
    });
    newUser.loginHistory = [buildLoginHistoryEntry(req)];
    await newUser.save();

    return res.status(201).send(newUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

//Login
export async function loginUser(req, res) {
  try {
    const { email, recordLogin } = req.query;

    if (!email) {
      return res.status(400).send({ error: "Email Required." });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (recordLogin === "true") {
      const updatedUser = await appendLoginHistory(user, req);
      return res.status(200).send(updatedUser);
    }

    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

//Update profile
export async function updateUser(req, res) {
  try {
    const normalizeEmail = (value = "") => value.trim().toLowerCase();
    const normalizePhone = (value = "") => {
      const trimmed = value.trim().replace(/[\s()-]/g, "");
      if (trimmed.startsWith("00")) return `+${trimmed.slice(2)}`;
      return trimmed;
    };

    const email = normalizeEmail(req.params.email || "");
    if (!email) {
      return res.status(400).send({ error: "Email Required." });
    }

    const profileUpdate = {
      displayName: req.body.displayName ?? "",
      bio: req.body.bio ?? "",
      location: req.body.location ?? "",
      website: req.body.website ?? "",
      avatar: req.body.avatar ?? "",
      phone: normalizePhone(req.body.phone || ""),
    };

    const updated = await UserModel.findOneAndUpdate(
      { email },
      { $set: profileUpdate },
      { returnDocument: "after", upsert: false },
    );
    if (!updated) {
      return res.status(404).send({ error: "User not found" });
    }
    return res.status(200).send(updated);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

// Forgot Password
export async function forgotPassword(req, res) {
  try {
    const { email, phone } = req.body;
    const trimmedEmail = email?.trim();
    const trimmedPhone = phone?.trim();

    if (!trimmedEmail && !trimmedPhone) {
      return res.status(400).json({ message: "Email or phone number required" });
    }

    const user = await UserModel.findOne(
      trimmedEmail ? { email: trimmedEmail } : { phone: trimmedPhone },
    );

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const now = new Date();

    if (user.resetPasswordRequestedAt) {
      const lastDay = new Date(user.resetPasswordRequestedAt);

      const sameDay = now.toDateString() === lastDay.toDateString();

      if (sameDay) {
        return res
          .status(400)
          .json({ message: "You can use this option only one time per day." });
      }
    }
    user.resetPasswordRequestedAt = now;
    await user.save();

    return res.status(200).json({
      message: "Allowed to reset your PASSWORD",
      resetEmail: user.email,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
