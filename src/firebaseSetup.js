// src/firebaseSetup.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Use public demo keys or instruct user to replace. 
// Firebase Auth requires actual domains to be whitelisted (like surge.sh).
// We will mock the provider if config is missing, but wire the real SDK so it works if they paste config.

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
    console.warn("Firebase Init bypassed due to placeholder keys.");
}

export { auth, googleProvider };
