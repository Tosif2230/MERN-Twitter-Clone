export default function authRoute(app) {
  //Regester
  app.post("/api/register", registerUser);

  //login
  app.post("/api/login", loginUser);

  //Update Profile
  app.patch("/api/userUpdate/:id", userUpdate);
}
