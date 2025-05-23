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
  sessionId: string;
}

interface Session {
  $id: string;
  date: Date;
  isActive: boolean;
}

interface NewSession {
  date: Date;
  isActive: boolean;
}
