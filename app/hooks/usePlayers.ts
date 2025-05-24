import useFetch from "@/services/useFetch";
import { getAllPlayers } from "@/firebase";

const usePlayers = (sessionId: string | null) => {
  const { data, loading, error, refetch } = useFetch(() => {
    if (!sessionId) throw new Error("Session ID is required.");
    return getAllPlayers(sessionId);
  }, !!sessionId); // Fetch only when sessionId exists

  return { players: data, loading, error, refetch };
};

export default usePlayers;
