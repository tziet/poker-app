interface NewPlayer {
  name: string;
  chips: number;
  endgameChips: number;
  seat: number | null;
  sessionId: string;
}

interface Player extends NewPlayer {
  $id: string;
}

interface NewSession {
  date: firebase.firestore.Timestamp;
  isActive: boolean;
  userId: string;
}

interface Session extends NewSession {
  $id: string;
}
