import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check for required environment variables
const isFirebaseConfigValid = !!import.meta.env.VITE_FIREBASE_API_KEY;

let app;
let auth;
let db;

if (isFirebaseConfigValid) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    console.warn("Firebase configuration is missing or invalid. Check your .env file.");
    // Provide dummy objects to prevent top-level crashes
    app = {};
    auth = { onAuthStateChanged: (cb) => { cb(null); return () => { }; } };
    db = {};
}

export { auth, db };

// Enable persistence - lazy triggered
let persistencePromise = null;
export const initPersistence = () => {
    if (!db) return Promise.resolve();
    if (!persistencePromise) {
        persistencePromise = enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn("Persistence failed: Multiple tabs open");
            } else if (err.code === 'unimplemented') {
                console.warn("Persistence not supported by browser");
            }
        });
    }
    return persistencePromise;
};

export const googleProvider = new GoogleAuthProvider();


