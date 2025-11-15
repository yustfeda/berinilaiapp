// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAcvki1li6f1jk3vPj9DsrasAF7pBKrNY",
  authDomain: "pbbapp.firebaseapp.com",
  databaseURL: "https://pbbapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pbbapp",
  storageBucket: "pbbapp.firebasestorage.app",
  messagingSenderId: "867856190828",
  appId: "1:867856190828:web:536ad2acf331da25b9b749"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
