import { useState, useEffect, useCallback } from "react";
import { fetchWithCache, dataCache } from "../lib/cache";

interface UseDataFetchingOptions {
  cacheKey?: string;
  ttl?: number;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useDataFetching<T = any>(
  url: string | null,
  options: UseDataFetchingOptions = {}
) {
  const {
    cacheKey,
    ttl = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!url || !enabled) return;

      try {
        setLoading(true);
        setError(null);

        // Clear cache if force refresh
        if (forceRefresh && cacheKey) {
          dataCache.clear(cacheKey);
        }

        // Fetch with cache
        const result = await fetchWithCache<T>(
          `${url}?timestamp=${Date.now()}`,
          { cache: "no-store" },
          cacheKey || url,
          ttl
        );

        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    },
    [url, cacheKey, ttl, enabled, onSuccess, onError]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    refetch: fetchData,
  };
}

