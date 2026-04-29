import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDgE9XssX6VT1SxQuDzR-FOnq4S7FE3Zcw",
  authDomain: "proradiobiz.firebaseapp.com",
  databaseURL: "https://proradiobiz-default-rtdb.firebaseio.com",
  projectId: "proradiobiz",
  storageBucket: "proradiobiz.firebasestorage.app",
  messagingSenderId: "601173283890",
  appId: "1:601173283890:web:ee0af646f3b06e3878d82b"
};

let app;
let db: Database;
let auth: Auth;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
}

export { db, auth };
