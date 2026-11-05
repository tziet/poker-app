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
  getReactNativePersistence,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "@/services/firebase";
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

export const GOOGLE_ACCOUNT_MESSAGE =
  "This email is registered with Google. Please use 'Continue with Google' to sign in.";

// Best effort: returns [] when Firebase email enumeration protection is on.
const isGoogleOnlyEmail = async (email: string) => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email.trim());
    return methods.includes("google.com") && !methods.includes("password");
  } catch {
    return false;
  }
};

export const signUpWithEmailPassword = async (
  email: string,
  password: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    try {
      await sendEmailVerification(userCredential.user);
    } catch {
      // Verification email is best effort; don't block sign up.
    }
    return userCredential.user;
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      if (await isGoogleOnlyEmail(email)) {
        throw new Error(GOOGLE_ACCOUNT_MESSAGE);
      }
      throw new Error(
        "An account with this email already exists. Try logging in, or use 'Continue with Google'.",
      );
    }
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
      email.trim(),
      password,
    );
    // Accounts that have Google linked must sign in with Google only.
    // (Works even when email enumeration protection hides sign-in methods.)
    if (
      userCredential.user.providerData.some((p) => p.providerId === "google.com")
    ) {
      await signOut(auth);
      throw new Error(GOOGLE_ACCOUNT_MESSAGE);
    }
    return userCredential.user;
  } catch (error: any) {
    if (error.message === GOOGLE_ACCOUNT_MESSAGE) throw error;
    const wrongCredentials = [
      "auth/invalid-credential",
      "auth/wrong-password",
      "auth/user-not-found",
    ];
    if (wrongCredentials.includes(error.code)) {
      if (await isGoogleOnlyEmail(email)) {
        throw new Error(GOOGLE_ACCOUNT_MESSAGE);
      }
      throw new Error(
        "Incorrect email or password. If you signed up with Google, use 'Continue with Google'.",
      );
    }
    throw new Error(error.message);
  }
};

export const sendPasswordReset = async (email: string) => {
  if (!email.trim()) {
    throw new Error("Please enter your email first");
  }
  try {
    // Server-side check (works even with email enumeration protection on).
    const check = httpsCallable(getFunctions(app), "checkPasswordResetAllowed");
    await check({ email: email.trim() });
  } catch (error: any) {
    if (error.code === "functions/failed-precondition") {
      throw new Error(GOOGLE_ACCOUNT_MESSAGE);
    }
    throw new Error("Could not verify this email right now. Please try again.");
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
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
