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

export const createSession = async (data: NewSession): Promise<Session> => {
  const docRef = await addDoc(collection(db, "sessions"), data); // "sessions" is the Firestore collection name
  return {
    $id: docRef.id,
    ...data,
  };
};

export const getActiveSession = async (): Promise<Session | null> => {
  const querySnapshot = await getDocs(collection(db, "sessions"));
  const activeSession = querySnapshot.docs.find(
    (doc) => doc.data().isActive == true,
  );
  return activeSession?.data() as Session | null;
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

export const getAllPlayers = async (): Promise<(Player | null)[]> => {
  const playersRef = collection(db, "players");
  const q = query(playersRef, orderBy("seat", "asc")); // Order players by seat number

  const snapshot = await getDocs(q);

  // Create an array with 8 null entries (one for each seat)
  const data = Array(8).fill(null);

  snapshot.docs.forEach((doc) => {
    const player = {
      $id: doc.id,
      ...doc.data(),
    } as Player;

    if (player.seat !== null && player.seat >= 0 && player.seat < 8) {
      data[player.seat] = player; // Place player based on their "seat"
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

export const getTableMoneySum = async (): Promise<number> => {
  const querySnapshot = await getDocs(collection(db, "players"));
  let moneySum = 0;

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    moneySum += data.chips || 0; // Accumulate the chips field's value
  });

  return moneySum;
};
