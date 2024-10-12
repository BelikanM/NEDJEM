// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBpHAFxdho0Gb63EE86k-NmSrD1zckEcSQ', // Assurez-vous que c'est la clé correcte
  authDomain: 'starviews.firebaseapp.com',
  projectId: 'starviews',
  storageBucket: 'starviews.appspot.com',
  messagingSenderId: '92372461515',
  appId: '1:92372461515:web:957158c9f62cb94ca6384e'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // Google Auth Provider
const storage = getStorage(app);

// Export the services for use
export { db, auth, provider, storage };
