interface Player {
  $id: string;
  name: string;
  chips: number;
  seat: number | null;
  sessionId: string;
}

interface NewPlayer {
  name: string;
  chips: number;
  seat: number | null;
}

interface Session {
  $id: string;
  date: string;
  name: string;
}

interface NewSession {
  name: string;
}
