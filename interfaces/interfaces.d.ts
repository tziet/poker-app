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
  /** Chips worth one unit of money (₪1). Missing on legacy sessions, which use 1:1. */
  chipRate?: number;
  /** Whether amounts are typed in "money" or "chips" (only matters when chipRate isn't 1). Defaults to money. */
  entryUnit?: "money" | "chips";
}

interface Session extends NewSession {
  $id: string;
}
