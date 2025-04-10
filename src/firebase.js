// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzLDIpLYo0OnBrfgA5d9hz7dVv5m3S24g",
  authDomain: "app-reservation-d30ab.firebaseapp.com",
  projectId: "app-reservation-d30ab",
  storageBucket: "app-reservation-d30ab.firebasestorage.app",
  messagingSenderId: "305156149086",
  appId: "1:305156149086:web:350eb8b892aa58573d09cf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
