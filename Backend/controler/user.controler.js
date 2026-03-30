import UserModel from "../models/user.model.js";

//Regester
export async function registerUser(req, res) {
  try {
    let { userName, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exist with this email." });
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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email Required." });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(201).send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

//Update profile
export async function userUpdate(req, res) {
  try {
    const { id } = req.params;
    const updated = await UserModel.findOneAndUpdate(
      id,
      { $set: req.body },
      { new: true, upsert: false },
    );
    return res.status(200).send(updated);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}
