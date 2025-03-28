import { auth, firestore } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Helper to save/update a user's data in Firestore.
 * You can customize this to add more fields if needed.
 */
const saveUserToFirestore = async (uid, email, displayName = "", photoURL = "") => {
  try {
    await setDoc(doc(firestore, "users", uid), {
      email,
      displayName,
      photoURL,
      createdAt: serverTimestamp(),
    }, { merge: true }); 
    // 'merge: true' ensures we don't overwrite existing fields if they exist
    console.log("User data saved to Firestore");
  } catch (error) {
    console.error("Error saving user data: ", error);
  }
};

/**
 * Creates a new user with email/password,
 * then saves to Firestore.
 */
export const doCreateUserWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user to Firestore
    await saveUserToFirestore(user.uid, user.email, user.displayName, user.photoURL);

    return user; // Return the user so the caller can do further actions
  } catch (error) {
    console.error("Error creating user: ", error);
    throw error; // Rethrow so caller can handle
  }
};

/**
 * Signs in an existing user with email/password.
 */
export const doSignInWithEmailAndPassword = (email, password) => {
  // Return the promise to chain or await
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Signs in using Google, then saves user data to Firestore
 * (including displayName/photoURL if available).
 */
export const doSignInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save user to Firestore (merge in case user doc already exists)
    await saveUserToFirestore(user.uid, user.email, user.displayName, user.photoURL);

    return user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

/**
 * Signs out the current user from Firebase Auth.
 */
export const doSignOut = () => {
  // Return the signOut promise so we can await or chain .then()
  return auth.signOut();
};

/**
 * Sends a password reset email to the given email address.
 */
export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

/**
 * Changes the currently logged-in user's password.
 */
export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

/**
 * Sends an email verification link to the currently logged-in user.
 */
export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};
