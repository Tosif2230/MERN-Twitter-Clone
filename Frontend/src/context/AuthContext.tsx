"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { auth } from "./FireBase";
import axiosInstance from "../lib/axiosInstance.js";
import { toast } from "react-toastify";
import i18n from "../i18n";

interface User {
  _id: string;
  userName: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  phone?: string;
  location: string;
  website: string;
  subscriptionPlan?: string;
  subscriptionPrice?: number;
  subscriptionOrderId?: string;
  subscriptionPaymentId?: string;
  subscriptionDate?: string;
  subscriptionExpiresAt?: string;
  loginHistory?: {
    browser: string;
    operatingSystem: string;
    deviceCategory: string;
    ipAddress: string;
    loggedInAt: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    phone: string,
    userName: string,
    displayName: string,
  ) => Promise<void>;
  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
    phone: string;
  }) => Promise<void>;
  logout: () => void;
  googleSignin: () => void;
  refreshUser: (
    email?: string,
    recordLogin?: boolean,
    forceRecordLogin?: boolean,
  ) => Promise<void>;
  isLoading: boolean;
  notificationsEnabled: boolean;
  setNotificationsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const getLoginSessionKey = (email: string) =>
  `twitter-login-session:${email.toLowerCase()}`;

const hasRecordedCurrentBrowserSession = (email: string) =>
  sessionStorage.getItem(getLoginSessionKey(email)) === "true";

const markCurrentBrowserSessionRecorded = (email: string) => {
  sessionStorage.setItem(getLoginSessionKey(email), "true");
};

const clearCurrentBrowserSessionRecorded = (email: string) => {
  sessionStorage.removeItem(getLoginSessionKey(email));
};

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const suppressNextAuthStateLoginRecord = useRef(false);

  const refreshUser = useCallback(
    async (email?: string, recordLogin = false, forceRecordLogin = false) => {
      const targetEmail = email || auth.currentUser?.email || user?.email;
      if (!targetEmail) return;
      const shouldRecordLogin =
        recordLogin &&
        (forceRecordLogin || !hasRecordedCurrentBrowserSession(targetEmail));

      if (shouldRecordLogin) {
        markCurrentBrowserSessionRecorded(targetEmail);
      }

      try {
        const res = await axiosInstance.get("/api/login", {
          params: { email: targetEmail, recordLogin: shouldRecordLogin },
        });

        if (res.data) {
          setUser(res.data);
          localStorage.setItem("twitter-user", JSON.stringify(res.data));
        }
      } catch (error) {
        if (shouldRecordLogin) {
          clearCurrentBrowserSessionRecorded(targetEmail);
        }
        throw error;
      }
    },
    [user?.email],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          const shouldRecordLogin = !suppressNextAuthStateLoginRecord.current;
          suppressNextAuthStateLoginRecord.current = false;
          await refreshUser(firebaseUser.email, shouldRecordLogin);
        } catch (error) {
          console.log(i18n.t("auth.fetchUserFailed"), error);
        }
      } else {
        setUser(null);
        localStorage.removeItem("twitter-user");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      suppressNextAuthStateLoginRecord.current = true;
      const usercred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = usercred.user;
      if (firebaseUser.email) {
        await refreshUser(firebaseUser.email, true, true);
        toast.success(i18n.t("auth.loginSuccess"));
      }
    } catch (error: any) {
      suppressNextAuthStateLoginRecord.current = false;
      // console.error("Login Error:", error);
      toast.error(error.message || i18n.t("auth.loginFailed"));
      throw error;
    } finally {
      setIsLoading(false);
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
  };

  const signup = async (
    email: string,
    password: string,
    phone: string,
    userName: string,
    displayName: string,
  ) => {
    setIsLoading(true);

    try {
      suppressNextAuthStateLoginRecord.current = true;
      const usercred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = usercred.user;

      const newUser: any = {
        userName,
        displayName,
        avatar:
          user.photoURL ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgYpOOYgMxD_FO9y7jYv2F_DwMnnVMBj8rWQ&s",
        email: user.email,
        phone,
      };
      const res = await axiosInstance.post("/api/register", newUser);

      if (res.data) {
        setUser(res.data);
        localStorage.setItem("twitter-user", JSON.stringify(res.data));
        if (user.email) {
          markCurrentBrowserSessionRecorded(user.email);
        }
        toast.success(i18n.t("auth.signupSuccess"));
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
    } catch (error: any) {
      suppressNextAuthStateLoginRecord.current = false;
      console.error(error);
      toast.error(error.message || i18n.t("auth.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const loggedOutEmail = user?.email || auth.currentUser?.email;
    setUser(null);
    await signOut(auth);
    if (loggedOutEmail) {
      clearCurrentBrowserSessionRecorded(loggedOutEmail);
    }
    localStorage.removeItem("twitter-user");
    toast.success(i18n.t("auth.logoutSuccess"));
  };

  const updateProfile = async (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
    phone: string;
  }) => {
    if (!user) return;

    setIsLoading(true);

    try {
      const res = await axiosInstance.patch(
        `/api/updateUser/${encodeURIComponent(user.email)}`,
        {
          displayName: profileData.displayName,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          avatar: profileData.avatar,
          phone: profileData.phone,
        },
      );

      if (res.data) {
        setUser(res.data);
        localStorage.setItem("twitter-user", JSON.stringify(res.data));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignin = async () => {
    setIsLoading(true);
    try {
      const googleauthProvider = new GoogleAuthProvider();
      suppressNextAuthStateLoginRecord.current = true;
      const result = await signInWithPopup(auth, googleauthProvider);
      const firebaseUser = result.user;

      if (!firebaseUser?.email) {
        throw new Error(i18n.t("auth.googleNoEmail"));
      }

      let userData;
      try {
        const res = await axiosInstance.get("/api/login", {
          params: { email: firebaseUser.email, recordLogin: true },
        });
        userData = res.data;
        markCurrentBrowserSessionRecorded(firebaseUser.email);
      } catch {
        const newUser = {
          userName: firebaseUser.email.split("@")[0],
          displayName: firebaseUser.displayName || i18n.t("auth.googleDefaultName"),
          avatar: firebaseUser.photoURL || "",
          email: firebaseUser.email,
        };
        const res = await axiosInstance.post("/api/register", newUser);
        userData = res.data;
        markCurrentBrowserSessionRecorded(firebaseUser.email);
      }
      if (userData) {
        setUser(userData);
        localStorage.setItem("twitter-user", JSON.stringify(userData));

        toast.success(i18n.t("auth.googleSuccess"));
      } else {
        throw new Error(i18n.t("auth.userDataMissing"));
      }
    } catch (error: any) { 
      if (auth.currentUser?.email) {
        clearCurrentBrowserSessionRecorded(auth.currentUser.email);
      }
      suppressNextAuthStateLoginRecord.current = false;
      // console.error("Google Sign-In Error:", error);
      toast.error(
        error.response?.data?.message || error.message || i18n.t("auth.loginFailed"),
      );
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
        refreshUser,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
