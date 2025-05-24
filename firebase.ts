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

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

export const createPlayer = async (data: NewPlayer): Promise<Player> => {
  const docRef = await addDoc(collection(db, "players"), data); // "players" is the Firestore collection name
  return {
    $id: docRef.id,
    ...data,
  };
};

export const getPlayerDetails = async (id: string): Promise<Player | null> => {
  const docRef = doc(db, "players", id); // "players" is the Firestore collection name
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null; // Handle document not found
  }

  const data = docSnap.data();
  return {
    $id: docSnap.id,
    ...data,
  } as Player;
};

export const getAllPlayers = async (
  sessionId: string,
): Promise<(Player | null)[]> => {
  if (!sessionId || sessionId === "") {
    throw new Error("Invalid sessionId provided to getAllPlayers");
  }

  const playersRef = collection(db, "players");
  const q = query(
    playersRef,
    orderBy("seat", "asc"),
    where("sessionId", "==", sessionId),
  );

  const snapshot = await getDocs(q);

  const data = Array(8).fill(null);
  snapshot.docs.forEach((doc) => {
    const player = {
      $id: doc.id,
      ...doc.data(),
    } as Player;

    if (player.seat !== null && player.seat >= 0 && player.seat < 8) {
      data[player.seat] = player;
    }
  });

  return data;
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

export const getActiveSession = async (): Promise<Session | null> => {
  const querySnapshot = await getDocs(collection(db, "sessions"));
  const activeSessionDoc = querySnapshot.docs.find(
    (doc) => doc.data().isActive == true,
  );

  if (!activeSessionDoc) {
    return null; // No active session found
  }

  const activeSessionData = activeSessionDoc.data();
  return {
    $id: activeSessionDoc.id, // Include the document ID
    ...activeSessionData,
  } as Session;
};

export const getAllSessions = async (): Promise<(Session | null)[]> => {
  const playersRef = collection(db, "sessions");
  const q = query(playersRef, orderBy("date", "asc")); // Order players by seat number

  const snapshot = await getDocs(q);

  const data: (Session | null)[] = [];
  snapshot.docs.map((doc, index) => {
    data[index] = {
      $id: doc.id,
      ...doc.data(),
    } as Session;
  });

  return data;
};

export const updateSession = async (
  id: string,
  session: Session,
): Promise<void> => {
  const docRef = doc(db, "sessions", id); // "sessions" is the Firestore collection name
  await updateDoc(docRef, { ...session }); // Update the document with the new session data
};
