import firebase from 'firebase/app';
import "firebase/auth";
import 'firebase/firestore'
import 'firebase/storage'


const firebaseConfig = {
  apiKey: "AIzaSyDOZXbEtw0L1EnfOBlp80KTt5tcw5bQyxw",
  authDomain: "skillzk.firebaseapp.com",
  projectId: "skillzk",
  storageBucket: "skillzk.appspot.com",
  messagingSenderId: "622178367685",
  appId: "1:622178367685:web:ec28e6d578e7f4662c98ac",
  measurementId: "G-6BVXGZBWJ0"
  };

const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth()
export const firestore = app.firestore();
export const storage = app.storage();


