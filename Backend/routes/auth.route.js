import { loginUser, registerUser, updateUser } from "../controllers/user.controllers.js";

export default function authRoute(app) {
  //Regester
  app.post("/api/register", registerUser);

  //login
  app.get("/api/login", loginUser);

  //Update Profile
  app.patch("/api/updateUser/:email", updateUser);
}
