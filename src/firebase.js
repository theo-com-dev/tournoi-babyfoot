import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Remplace ces valeurs par celles de ta console Firebase
const firebaseConfig = {
  apiKey: "REMPLACER_ICI",
  authDomain: "REMPLACER_ICI",
  projectId: "REMPLACER_ICI",
  storageBucket: "REMPLACER_ICI",
  messagingSenderId: "REMPLACER_ICI",
  appId: "REMPLACER_ICI",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
