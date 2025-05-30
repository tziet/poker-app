import useFetch from "@/services/useFetch";
import { getActiveSession } from "@/services/firebase";
import { useAuth } from "@/contexts/AuthContext";

const useActiveSession = () => {
  const { user, loading: authLoading } = useAuth();

  const {
    data,
    loading: fetchLoading,
    error,
    refetch,
  } = useFetch(
    () => getActiveSession(user?.uid || null),
    // Only run the fetch when we have auth state loaded
    authLoading,
  );

  return {
    session: data,
    loading: authLoading || fetchLoading,
    error,
    refetch,
  };
};

export default useActiveSession;
