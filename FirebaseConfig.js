/**
 * FirebaseConfig.js
 * 
 * Paste your Firebase Web App configuration credentials here.
 * Once valid keys are provided, the app will automatically switch from 
 * local storage mode to a global Firebase Firestore real-time leaderboard!
 * 
 * To setup a free Firebase Project:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project, and add a "Web App".
 * 3. Enable Cloud Firestore in "Test Mode" (or configure security rules).
 * 4. Copy the config object below.
 */
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID_HERE.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_PROJECT_ID_HERE.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
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
