// src/firebaseSetup.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// คุณต้องเอา API Key จริงมาใส่ตรงนี้
const firebaseConfig = {
    apiKey: "AIzaSyCCzzGujb1vW17tTrL0JajlXrGQOPqDIxU",
    authDomain: "travel-app-pitiwxt.firebaseapp.com",
    projectId: "travel-app-pitiwxt",
    storageBucket: "travel-app-pitiwxt.firebasestorage.app",
    messagingSenderId: "656490541304",
    appId: "1:656490541304:web:05aa2732051cd2d69dcb0d",
    measurementId: "G-J7NTBLPC3K"
};

let app, auth, googleProvider;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
} catch (error) {
    console.error("Firebase config is invalid.");
}

export { auth, googleProvider };
