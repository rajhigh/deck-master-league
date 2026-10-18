/**
 * FIREBASE.JS — Inisialisasi Firebase & Firestore
 * Menggunakan Firebase v9 compat (CDN, tidak butuh npm/bundler)
 */

const firebaseConfig = {
  apiKey: "AIzaSyArgE4p30X2W1CRC5dzuRHgNzaqEBNefcU",
  authDomain: "deck-master-league-45a98.firebaseapp.com",
  projectId: "deck-master-league-45a98",
  storageBucket: "deck-master-league-45a98.firebasestorage.app",
  messagingSenderId: "354954733403",
  appId: "1:354954733403:web:23786d6928a2ecadef9c7e",
  measurementId: "G-0CZXZJL2HN"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
