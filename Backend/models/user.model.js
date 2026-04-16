import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  userName: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  website: { type: String, default: "" },
  location: { type: String, default: "" },
  resetPasswordRequestedAt: { type: Date, default: null },
  joinedDate: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
