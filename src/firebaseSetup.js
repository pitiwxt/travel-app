// src/firebaseSetup.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// คุณต้องเอา API Key จริงมาใส่ตรงนี้
const firebaseConfig = {
    apiKey: "AIzaSy_REPLACE_WITH_REAL_KEY",
    authDomain: "travel-app-demo.firebaseapp.com",
    projectId: "travel-app-demo",
    storageBucket: "travel-app-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
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
