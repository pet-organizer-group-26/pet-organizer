import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLFon4-nIr7cRUGRc0rckge8T7YXXqnbg",
  authDomain: "pet-organizer-app.firebaseapp.com",
  projectId: "pet-organizer-app",
  storageBucket: "pet-organizer-app.appspot.com", // Fixed storage bucket format
  messagingSenderId: "294897435828",
  appId: "1:294897435828:ios:712173ff62f688019483e1",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

export default app;