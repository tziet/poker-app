import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const db = getFirestore(initializeApp(firebaseConfig));

export const createPlayer = async (data: NewPlayer) => {
  const docRef = await addDoc(collection(db, "players"), data);
  return { $id: docRef.id, ...data };
};

export const getPlayerDetails = async (id: string) => {
  const docSnap = await getDoc(doc(db, "players", id));
  if (!docSnap.exists()) return null;
  return { $id: docSnap.id, ...docSnap.data() } as Player;
};

export const getAllPlayers = async (sessionId: string) => {
  const q = query(
    collection(db, "players"),
    orderBy("seat", "asc"),
    where("sessionId", "==", sessionId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ $id: doc.id, ...doc.data() }));
};

export const updatePlayer = async (
  id: string,
  player: Player,
): Promise<void> => {
  const docRef = doc(db, "players", id); // "players" is the Firestore collection name
  await updateDoc(docRef, { ...player }); // Update the document with the new player data
};

export const deletePlayer = async (id: string): Promise<void> => {
  const docRef = doc(db, "players", id); // "players" is the Firestore collection name
  await deleteDoc(docRef); // Delete the document
};

export const getTableMoneySum = async (session: Session): Promise<number> => {
  const playersRef = collection(db, "players");
  const q = query(
    playersRef,
    orderBy("seat", "asc"),
    where("sessionId", "==", session.$id),
  );

  const querySnapshot = await getDocs(q);

  let moneySum = 0;

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    moneySum += data.chips || 0; // Accumulate the chips field's value
  });

  return moneySum;
};

export const createSession = async (data: NewSession): Promise<Session> => {
  const docRef = await addDoc(collection(db, "sessions"), data); // "sessions" is the Firestore collection name
  return {
    $id: docRef.id,
    ...data,
  };
};

export const getActiveSession = async (
  userId: string | null,
): Promise<Session | null> => {
  if (!userId) return null;

  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    where("isActive", "==", true),
  );

  const querySnapshot = await getDocs(q);
  const activeSessionDoc = querySnapshot.docs[0];

  if (!activeSessionDoc) {
    return null;
  }

  return {
    $id: activeSessionDoc.id,
    ...activeSessionDoc.data(),
  } as Session;
};

export const getAllSessions = async (
  userId: string | null,
): Promise<(Session | null)[]> => {
  if (!userId) return [];

  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) =>
      ({
        $id: doc.id,
        ...doc.data(),
      }) as Session,
  );
};

export const updateSession = async (
  id: string,
  session: Session,
): Promise<void> => {
  const docRef = doc(db, "sessions", id); // "sessions" is the Firestore collection name
  await updateDoc(docRef, { ...session }); // Update the document with the new session data
};
