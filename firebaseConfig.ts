import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgE_ePSbF7vgxTbQLqcfg-t0zyWAUl7Tc",
  authDomain: "horario2-73d64.firebaseapp.com",
  databaseURL: "https://horario2-73d64-default-rtdb.firebaseio.com",
  projectId: "horario2-73d64",
  storageBucket: "horario2-73d64.firebasestorage.app",
  messagingSenderId: "464078462316",
  appId: "1:464078462316:web:b8872853d3b788dda7a749"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);