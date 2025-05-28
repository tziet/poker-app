import useFetch from "@/services/useFetch";
import { getActiveSession } from "@/services/firebase";

const useActiveSession = () => {
  const { data, loading, error, refetch } = useFetch(getActiveSession);

  return {
    session: data,
    loading,
    error,
    refetch,
  };
};

export default useActiveSession;
