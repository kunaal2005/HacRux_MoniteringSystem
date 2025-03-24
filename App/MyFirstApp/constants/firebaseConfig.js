import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const getDatabase = require("firebase/database");
const getFirestore = require("firebase/firestore");


const firebaseConfig = {
    apiKey: "AIzaSyCTUx49h19ljtXNxUn1j_ClIwAXeQlav-E",
    authDomain: "iothack-e3e50.firebaseapp.com",
    databaseURL: "https://iothack-e3e50-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "iothack-e3e50",
    storageBucket: "iothack-e3e50.firebasestorage.app",
    messagingSenderId: "459237057118",
    appId: "1:459237057118:web:a5028d62b7951c72f40acf",
    measurementId: "G-SVC7VYKW38",
  };
const dbRef = getDatabase();
const db = db.ref("userId");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export { db };