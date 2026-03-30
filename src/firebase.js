import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCO5aZBZxPGgu-8nOzYhOjVbyJwsjiM24w",
  authDomain: "tournoi-babyfoot-28956.firebaseapp.com",
  projectId: "tournoi-babyfoot-28956",
  storageBucket: "tournoi-babyfoot-28956.firebasestorage.app",
  messagingSenderId: "549739865303",
  appId: "1:549739865303:web:a7fff91191051569c4fc92",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
