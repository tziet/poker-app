import useFetch from "@/services/useFetch";
import { getActiveSession } from "@/firebase";

const useSession = () => {
  const { data, loading, error, refetch } = useFetch(() => getActiveSession());
  return { session: data, loading, error, refetch };
};

export default useSession;
