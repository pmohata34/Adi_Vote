
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMU84yDaLumIIdujnY4FXPJ3ikCsEvMZ8",
  authDomain: "adivote-138ce.firebaseapp.com",
  projectId: "adivote-138ce",
  storageBucket: "adivote-138ce.firebasestorage.app",
  messagingSenderId: "524851333502",
  appId: "1:524851333502:web:15a67f4ff592ffd972cb2f",
  measurementId: "G-M6BDRN5M6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;