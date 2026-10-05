// Service workers can't read import.meta.env, so paste your Firebase web config here.
// These values are public identifiers (they're also shipped in your JS bundle), not secrets.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBbO4HZS2hJBPDjDGeCYspTbHPs9KeDapc",
  authDomain: "velpure-d3206.firebaseapp.com",
  projectId: "velpure-d3206",
  storageBucket: "velpure-d3206.firebasestorage.app",
  messagingSenderId: "841402758563",
  appId: "1:841402758563:web:ff2ed7f1e6855afa8b5616",
});

// Initialising messaging is enough: when a push carries a `notification`
// payload and the admin tab is closed or in the background, the browser
// displays it automatically.
firebase.messaging();
