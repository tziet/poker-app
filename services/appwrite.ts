import { Client, Databases, ID } from "react-native-appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

export { databases };

export const createPlayer = async (data: NewPlayer): Promise<Player> => {
  const response = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    data,
  );

  return {
    $id: response.$id,
    name: response.name,
    chips: response.chips,
    seat: response.seat,
  };
};

export const getPlayerDetails = async (id: string): Promise<Player[]> => {
  const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.equal("$id", id),
  ]);

  if (response.documents.length === 0) return [];

  return response.documents.map((doc) => ({
    $id: doc.$id,
    name: doc.name,
    chips: doc.chips,
    seat: doc.seat,
  }));
};

export const getAllPlayers = async (queries?: string[]): Promise<Player[]> => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    queries,
  );

  const data = Array(8).fill(null);
  response.documents.map((doc) => {
    data[doc.seat] = {
      $id: doc.$id,
      name: doc.name,
      chips: doc.chips,
      seat: doc.seat,
    };
  });
  return data;
};

export const updatePlayer = async (
  id: string,
  player: Player,
): Promise<Player> => {
  const response = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_ID,
    id,
    player,
  );

  if (!response.documents) {
    return null as any;
  }

  return {
    $id: response.documents.$id,
    name: response.documents.name,
    chips: response.documents.chips,
    seat: response.documents.seat,
  };
};

export const deletePlayer = async (id: string): Promise<void> => {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
};

export const getTableMoneySum = async (): Promise<number> => {
  const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
  let moneySum = 0;

  response.documents.map((doc) => {
    moneySum += doc.chips;
  });

  return moneySum;
};
