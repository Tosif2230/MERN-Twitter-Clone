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

//Delete User
