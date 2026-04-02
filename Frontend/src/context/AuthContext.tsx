"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./FireBase";
import axiosInstance from "../lib/axiosInstance.js";

interface User {
  _id: string;
  userName: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  location: string;
  website: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    userName: string,
    displayName: string,
  ) => Promise<void>;
  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => Promise<void>;
  logout: () => void;
  googleSignin: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          const res = await axiosInstance.get("/api/login", {
            params: { email: firebaseUser.email },
          });

          if (res.data) {
            setUser(res.data);
            localStorage.setItem("twitter-user", JSON.stringify(res.data));
          }
        } catch (error) {
          console.log("Failed to fetch user", error);
        }
      } else {
        setUser(null);
        localStorage.removeItem("twitter-user");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    const usercred = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = usercred.user;
    const res = await axiosInstance.get("/api/login", {
      params: { email: firebaseUser.email },
    });
    if (res.data) {
      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));
    }
    // const mockUser: User = {
    //   id: "1",
    //   userName: "jhondoe",
    //   displayName: "Jhon Doe",
    //   avatar:
    //     "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto-compress&cs-tinysrgb&w-400",
    //   bio: "Software developer passionate about building greate products.",
    //   joinedDate: "March 2026",
    // };
    setIsLoading(false);
  };

  const signup = async (
    email: string,
    password: string,
    userName: string,
    displayName: string,
  ) => {
    setIsLoading(true);
    const usercred = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = usercred.user;

    const newUser: any = {
      userName,
      displayName,
      avatar: user.photoURL || "",
      email: user.email,
    };
    const res = await axiosInstance.post("/api/register", newUser);
    if (res.data) {
      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));
    }
    // const mockUser: User = {
    //   id: "1",
    //   userName: userName,
    //   displayName: displayName,
    //   avatar:
    //     "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto-compress&cs-tinysrgb&w-400",
    //   bio: "Software developer passionate about building greate products.",
    //   joinedDate: "March 2026",
    // };
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
    localStorage.removeItem("twitter-user");
  };

  const updateProfile = async (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => {
    if (!user) return;

    setIsLoading(true);

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser: User = {
      ...user,
      ...profileData,
    };
    const res = await axiosInstance.patch(
      `/api/updateUser/${user.email}`,
      updatedUser,
    );
    if (res.data) {
      setUser(updatedUser);
      localStorage.setItem("twitter-user", JSON.stringify(updatedUser));
    }

    setIsLoading(false);
  };

  const googleSignin = async () => {
    setIsLoading(true);
    try {
      const googleauthProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleauthProvider);
      const firebaseUser = result.user;

      if (!firebaseUser?.email) {
        throw new Error("No email found in Google account");
      }

      let userData;
      try {
        const res = await axiosInstance.get("/api/login", {
          params: { email: firebaseUser.email },
        });
        userData = res.data;
      } catch {
        const newUser = {
          userName: firebaseUser.email.split("@")[0],
          displayName: firebaseUser.displayName || "User",
          avatar: firebaseUser.photoURL || "",
          email: firebaseUser.email,
        };
        const res = await axiosInstance.post("/api/register", newUser);
        userData = res.data;
      }
      if (userData) {
        setUser(userData);
        localStorage.setItem("twitter-user", JSON.stringify(userData));
      } else {
        throw new Error("Login/Register failed: No user data returned");
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      alert(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        updateProfile,
        logout,
        isLoading,
        googleSignin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
