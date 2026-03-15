"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  userName: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  website: string;
  location: string;
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
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const savedUser = localStorage.getItem("twitter-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUser: User = {
      id: "1",
      userName: "jhondoe",
      displayName: "Jhon Doe",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto-compress&cs-tinysrgb&w-400",
      bio: "Software developer passionate about building greate products.",
      joinedDate: "March 2026",
    };
    setUser(mockUser);
    localStorage.setItem("twitter-user", JSON.stringify(mockUser));
    setIsLoading(false);
  };
  const signup = async (
    email: string,
    password: string,
    userName: string,
    displayName: string,
  ) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUser: User = {
      id: "1",
      userName: userName,
      displayName: displayName,
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto-compress&cs-tinysrgb&w-400",
      bio: "Software developer passionate about building greate products.",
      joinedDate: "March 2026",
    };
    setUser(mockUser);
    localStorage.setItem("twitter-user", JSON.stringify(mockUser));
    setIsLoading(false);
  };
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("twitter-user");
  };

  const updateProfile = async (profileDate: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
  }) => {
    if (!user) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const updateUser = {
      ...user,
      displayName: profileDate.displayName,
      bio: profileDate.bio,
    };

    setUser(updateUser);
    localStorage.setItem("twitter-user", JSON.stringify(updateUser));
    setIsLoading(false);
  };
  return (
    <AuthContext.Provider
      value={{ user, login, signup, updateProfile, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
