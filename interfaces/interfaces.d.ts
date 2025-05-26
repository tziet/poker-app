interface Player {
  $id: string;
  name: string;
  chips: number;
  endgameChips: number;
  seat: number | null;
  sessionId: string;
}

interface NewPlayer extends Player {
  $id?: string;
}

interface Session {
  $id: string;
  date: firebase.firestore.Timestamp;
  isActive: boolean;
}

interface NewSession extends Session {
  $id?: string;
}
