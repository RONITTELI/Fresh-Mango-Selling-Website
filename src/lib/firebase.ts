import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  get,
  update,
  onValue,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";

const requiredEnv = (key: keyof ImportMetaEnv) => {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const optionalEnv = (key: keyof ImportMetaEnv) => {
  const value = import.meta.env[key];
  return value && typeof value === "string" && value.length ? value : undefined;
};

const firebaseConfig = {
  apiKey: requiredEnv("VITE_FIREBASE_API_KEY"),
  authDomain: requiredEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  databaseURL: requiredEnv("VITE_FIREBASE_DATABASE_URL"),
  projectId: requiredEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requiredEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requiredEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requiredEnv("VITE_FIREBASE_APP_ID"),
  // Measurement is optional; omit if not configured.
  measurementId: optionalEnv("VITE_FIREBASE_MEASUREMENT_ID"),
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { 
  database, 
  auth,
  ref, 
  push, 
  get, 
  update, 
  onValue,
  query,
  orderByChild,
  limitToLast,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
};

export type { User };
