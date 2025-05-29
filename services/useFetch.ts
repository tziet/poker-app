import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred"),
      );
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) fetchData();
  }, [autoFetch, fetchData]);

  // Fetch on focus
  useFocusEffect(
    useCallback(() => {
      if (autoFetch) fetchData();
      return () => {}; // Cleanup function
    }, [autoFetch, fetchData]),
  );

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
