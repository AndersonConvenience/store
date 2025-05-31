import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
  where,
  setDoc // ✅ ADD THIS!
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAhorvdeFQ8zV_PMa7seemlyNT1ITygKJc",
  authDomain: "anderson-convenience-sto-55978.firebaseapp.com",
  projectId: "anderson-convenience-sto-55978",
  storageBucket: "anderson-convenience-sto-55978.appspot.com",
  messagingSenderId: "1085719794613",
  appId: "1:1085719794613:web:992263d9f4c20efd3e3ffc",
  measurementId: "G-RRK2W093RC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  getAuth,
  auth,
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  onSnapshot,
  signOut,
  setDoc // ✅ EXPORT IT!
};
