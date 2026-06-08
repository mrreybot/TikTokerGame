/**
 * FirebaseConfig.js
 * 
 * Paste your Firebase Web App configuration credentials here.
 * Once valid keys are provided, the app will automatically switch from 
 * local storage mode to a global Firebase Firestore real-time leaderboard!
 */
export const firebaseConfig = {
    apiKey: "AIzaSyCX1oegHeLZB_J33gLJYz6hCugOZthHV-Q",
    authDomain: "tiktokgames-8c36b.firebaseapp.com",
    projectId: "tiktokgames-8c36b",
    storageBucket: "tiktokgames-8c36b.firebasestorage.app",
    messagingSenderId: "322766808364",
    appId: "1:322766808364:web:1d1bb0a35c398543067889",
    measurementId: "G-KY3RY0XBXN"
};

/**
 * Run-time verification to detect if placeholder config was replaced.
 * Showcase: PL Concept 7 (Run-time validation check).
 */
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey && 
           firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
           firebaseConfig.projectId !== "YOUR_PROJECT_ID_HERE";
};
