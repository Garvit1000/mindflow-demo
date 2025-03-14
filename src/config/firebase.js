import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbSszj-Ec-R284Fwryj-7KWN2r9RMiCEM",
  authDomain: "amdroid-app-e6e67.firebaseapp.com",
  projectId: "amdroid-app-e6e67",
  storageBucket: "amdroid-app-e6e67.firebasestorage.app",
  messagingSenderId: "758156712534",
  appId: "1:758156712534:web:c23fcbb31f1c2010d5f9f7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
