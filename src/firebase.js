// src/firebase.js
import firebase from 'firebase/app';
import 'firebase/messaging';

const firebaseConfig = {

  apiKey: "AIzaSyBpHAFxdho0Gb63EE86k-NmSrD1zckEcSQ",

  authDomain: "starviews.firebaseapp.com",

  projectId: "starviews",

  storageBucket: "starviews.appspot.com",

  messagingSenderId: "92372461515",

  appId: "1:92372461515:web:957158c9f62cb94ca6384e"

};

firebase.initializeApp(firebaseConfig);

export const messaging = firebase.messaging();
