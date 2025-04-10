// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";  // Importer l'authentification
import { getFirestore } from "firebase/firestore";  // Firestore pour la base de données

// Configuration de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDzLDIpLYo0OnBrfgA5d9hz7dVv5m3S24g",
  authDomain: "app-reservation-d30ab.firebaseapp.com",
  projectId: "app-reservation-d30ab",
  storageBucket: "app-reservation-d30ab.firebasestorage.app",
  messagingSenderId: "305156149086",
  appId: "1:305156149086:web:350eb8b892aa58573d09cf"
};

// Initialiser l'application Firebase
const app = initializeApp(firebaseConfig);

// Obtenir l'instance de l'authentification et de Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Exporter les instances pour les utiliser ailleurs dans ton application
export { auth, db };
