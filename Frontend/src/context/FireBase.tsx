import { initializeApp } from "firebase/app";
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
