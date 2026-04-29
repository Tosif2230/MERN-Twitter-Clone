import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  userName: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  bio: { type: String, default: "" },
  website: { type: String, default: "" },
  location: { type: String, default: "" },
  language: { type: String, default: "en" },
  subscriptionPlan: { type: String, default: "Free" },
  subscriptionPrice: { type: Number, default: 0 },
  subscriptionOrderId: { type: String, default: "" },
  subscriptionPaymentId: { type: String, default: "" },
  subscriptionDate: { type: Date, default: null },
  subscriptionExpiresAt: { type: Date, default: null },
  resetPasswordRequestedAt: { type: Date, default: null },
  loginHistory: {
    type: [
      {
        browser: { type: String, default: "Unknown browser" },
        operatingSystem: { type: String, default: "Unknown OS" },
        deviceCategory: { type: String, default: "desktop" },
        ipAddress: { type: String, default: "Unknown IP" },
        loggedInAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  joinedDate: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
