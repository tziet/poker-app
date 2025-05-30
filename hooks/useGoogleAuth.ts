import * as Google from "expo-auth-session/providers/google";
import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/services/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
    responseType: "id_token",
    scopes: ["profile", "email"],
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then((result) => {
          const user = result.user;
          return setDoc(
            doc(db, "users", user.uid),
            {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: new Date(),
            },
            { merge: true },
          );
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  }, [response]);

  return {
    promptAsync,
    error,
  };
};
