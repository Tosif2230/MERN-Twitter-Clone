
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAImUbkCIDxkQDLQFYz4DCEQp8x-M29LxU",
  authDomain: "twitter-c1a0a.firebaseapp.com",
  projectId: "twitter-c1a0a",
  storageBucket: "twitter-c1a0a.firebasestorage.app",
  messagingSenderId: "627969537705",
  appId: "1:627969537705:web:e0aad1e8705dbf685cdbb8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);

export default app