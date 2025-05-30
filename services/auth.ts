import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  initializeAuth,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { firebaseConfig } from "@/services/firebase";
import { getReactNativePersistence } from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getFirestore, setDoc } from "firebase/firestore";

interface UserData {
  displayName: string;
  phoneNumber: string;
  createdAt: Date;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

const COOLDOWN_KEY = "auth_cooldown";
const COOLDOWN_DURATION = 60 * 1000; // 60 seconds

const getReadableErrorMessage = (error: any) => {
  switch (error.code) {
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/invalid-phone-number":
      return "Please enter a valid phone number.";
    case "auth/invalid-verification-code":
      return "Invalid verification code. Please try again.";
    default:
      return error.message;
  }
};

export const sendVerificationCode = async (
  phoneNumber: string,
  recaptchaVerifier: any,
) => {
  try {
    // Check cooldown
    const lastAttempt = await AsyncStorage.getItem(COOLDOWN_KEY);
    if (lastAttempt) {
      const timeLeft = COOLDOWN_DURATION - (Date.now() - parseInt(lastAttempt));
      if (timeLeft > 0) {
        throw new Error(
          `Please wait ${Math.ceil(timeLeft / 1000)} seconds before trying again`,
        );
      }
    }

    const confirmation = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier,
    );

    // Set cooldown timestamp
    await AsyncStorage.setItem(COOLDOWN_KEY, Date.now().toString());

    return confirmation;
  } catch (error: any) {
    throw new Error(getReadableErrorMessage(error));
  }
};

export const confirmVerificationCode = async (
  verificationId: string,
  code: string,
) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const registerWithPhone = async (
  verificationId: string,
  code: string,
  userData: UserData,
) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCredential = await signInWithCredential(auth, credential);

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      ...userData,
      createdAt: new Date(),
    });

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginWithPhone = async (verificationId: string, code: string) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signUpWithEmailPassword = async (
  email: string,
  password: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginWithEmailPassword = async (
  email: string,
  password: string,
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signOutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void,
) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
