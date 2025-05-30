// firebase-config.js
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
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdld-tfYWCvuJj1hJVd5WtZ9El7PGShJo",
  authDomain: "anderson-convenience-store.firebaseapp.com",
  projectId: "anderson-convenience-store",
  storageBucket: "anderson-convenience-store.appspot.com",
  messagingSenderId: "443082558375",
  appId: "1:443082558375:web:c5391ea3beda5be7864482",
  measurementId: "G-PR6TDGXCQT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // ✅ Add Firebase Authentication

export {
  db,
  getAuth,
  auth, // ✅ Export the auth module
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
  signOut
};
