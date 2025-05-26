import useFetch from "@/services/useFetch";
import { getActiveSession } from "@/services/firebase";

const useSession = () => {
  const { data, loading, error, refetch } = useFetch(getActiveSession);

  if (error) {
    console.error("Error fetching session:", error);
  }

  return {
    session: data,
    loading,
    error,
    refetch,
  };
};

export default useSession;
