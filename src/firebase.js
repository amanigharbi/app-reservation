import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Importer Firestore pour ajouter des documents

// Configuration de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBFp1fyxgoDaH_PC1looZNUvWhrqX2zk0Y",
  authDomain: "app-reservation-2.firebaseapp.com",
  projectId: "app-reservation-2",
  storageBucket: "app-reservation-2.firebasestorage.app",
  messagingSenderId: "136303015264",
  appId: "1:136303015264:web:b39a396f8472d27f1cda05"
};

// Initialiser l'application Firebase
const app = initializeApp(firebaseConfig);

// Obtenir l'instance de l'authentification et de Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Exporter les instances pour les utiliser ailleurs dans ton application
export { auth, db, createUserWithEmailAndPassword, setDoc, doc };
