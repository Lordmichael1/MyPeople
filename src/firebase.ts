import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCd5LWeQg_0QR7Lv3731qhFpYjzuWCPgb4",
  authDomain: "mypeople-d3dee.firebaseapp.com",
  projectId: "mypeople-d3dee",
  storageBucket: "mypeople-d3dee.firebasestorage.app",
  messagingSenderId: "850930629340",
  appId: "1:850930629340:web:026dc4738ab39e62a15219",
  measurementId: "G-TMYFPKCGE5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export const auth = getAuth(app);