import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Importer Firestore pour ajouter des documents
import { getStorage } from "firebase/storage";

// Configuration de Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
console.log("Firebase API Key:", process.env.REACT_APP_FIREBASE_API_KEY);

// Initialiser l'application Firebase
const app = initializeApp(firebaseConfig);

// Obtenir l'instance de l'authentification et de Firestore
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage();

// Exporter les instances pour les utiliser ailleurs dans ton application
export { auth, db, createUserWithEmailAndPassword, setDoc, doc };
