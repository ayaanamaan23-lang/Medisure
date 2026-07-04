import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCu4y_OUh2QKAuij8GjbJWpkiPwmUzLzSU",
  authDomain: "livepulse-2851c.firebaseapp.com",
  databaseURL: "https://livepulse-2851c-default-rtdb.firebaseio.com",
  projectId: "livepulse-2851c",
  storageBucket: "livepulse-2851c.firebasestorage.app",
  messagingSenderId: "1059090394788",
  appId: "1:1059090394788:web:a950f81f4c70ca5ed58031"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };
