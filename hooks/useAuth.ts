import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import firebaseApp from "../constants/firebaseConfig";

const auth = getAuth(firebaseApp);

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Sign-in error:", error.message);
    } else {
      console.error("An unexpected error occurred during sign-in.");
    }
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Logout error:", error.message);
    } else {
      console.error("An unexpected error occurred during logout.");
    }
    throw error;
  }
};