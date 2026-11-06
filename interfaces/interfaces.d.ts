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
  /** Number of seats at the table (2-10). Missing on legacy sessions, which use 8. */
  seatCount?: number;
}

interface Session extends NewSession {
  $id: string;
}
