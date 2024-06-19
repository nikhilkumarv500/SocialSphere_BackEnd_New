const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyDHqXW8jP3Hwtd_dcCvsqfzAhQtH4E1ZuI",
  authDomain: "socialmedia-9ef86.firebaseapp.com",
  projectId: "socialmedia-9ef86",
  storageBucket: "socialmedia-9ef86.appspot.com",
  messagingSenderId: "125887390447",
  appId: "1:125887390447:web:2d10bfbaa85a3d5917f11a"
};


const app = initializeApp(firebaseConfig);
const fireBaseStorage = getStorage(app);

module.exports = {fireBaseStorage};
