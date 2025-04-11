import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs9TmZ_ylRg0Gmse-Ep07z1TkBhQDJO-k",
  authDomain: "wavedrive-vw.firebaseapp.com",
  projectId: "wavedrive-vw",
  storageBucket: "wavedrive-vw.firebasestorage.app",
  messagingSenderId: "889924108345",
  appId: "1:889924108345:web:1cfcea676527d5c6ff4de8",
  measurementId: "G-GRSFFC6MS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Export Firebase modules
export { app, auth, firestore };
