import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google using popup
export const signInWithGoogle = async () => {
  try {
    // Using popup instead of redirect for development environments
    // This can work better when the domain isn't authorized in Firebase
    const result = await signInWithPopup(auth, googleProvider);
    
    // User signed in
    const user = result.user;
    // Get the Google access token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    // Return user data for API call
    return {
      user,
      token
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Function to handle redirect result (kept for compatibility)
export const handleGoogleRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User signed in
      const user = result.user;
      // Get the Google access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      // Return user data for API call
      return {
        user,
        token
      };
    }
    return null;
  } catch (error) {
    console.error('Error handling Google redirect:', error);
    throw error;
  }
};

export { auth };