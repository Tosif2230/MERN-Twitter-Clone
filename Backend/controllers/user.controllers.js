import UserModel from "../models/user.model.js";

//Regester
export async function registerUser(req, res) {
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send(existingUser);
    }
    const newUser = new UserModel(req.body);
    await newUser.save();

    return res.status(201).send(newUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

//Login
export async function loginUser(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).send({ error: "Email Required." });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

//Update profile
export async function updateUser(req, res) {
  try {
    const { email } = req.params;
    const updated = await UserModel.findOneAndUpdate(
      { email },
      { $set: req.body },
      { returnDocument: "after", upsert: false },
    );
    return res.status(200).send(updated);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

// Forgot Password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email Required" });
    }
    const user = await UserModel.findOne({ email });

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

    return res.status(200).json({ message: "Allowed to reset your PASSWORD" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
