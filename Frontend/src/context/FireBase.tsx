import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "twitter-v2-527c6.firebaseapp.com",
  projectId: "twitter-v2-527c6",
  storageBucket: "twitter-v2-527c6.firebasestorage.app",
  messagingSenderId: "707934910799",
  appId: "1:707934910799:web:7573e74922372ab4cdad3a",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const phoneOtpApp =
  getApps().find((existingApp) => existingApp.name === "phone-otp-app") ||
  initializeApp(firebaseConfig, "phone-otp-app");
export const auth = getAuth(app);
export const phoneOtpAuth = getAuth(phoneOtpApp);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
