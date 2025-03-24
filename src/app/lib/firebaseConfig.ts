// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLLMdfIjhy9ATZ6penMXNKdaAflXwbVn4",
  authDomain: "breakdown-ab070.firebaseapp.com",
  projectId: "breakdown-ab070",
  storageBucket: "breakdown-ab070.firebasestorage.app",
  messagingSenderId: "182409771541",
  appId: "1:182409771541:web:5548ea17f86a68cec12c1c",
  measurementId: "G-1S8FZ0Y8FV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
    