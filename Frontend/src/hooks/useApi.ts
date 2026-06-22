import { useState, useEffect, useCallback, useRef } from 'react';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generic data-fetching hook.
 *
 * @param fetcher - An async function that returns an Axios-style response.
 *                  Recreate this function (via useCallback or inline in deps) to trigger a refetch.
 * @param deps    - Dependency array; the fetcher re-runs whenever these change.
 */
export function useApi<T>(
  fetcher: () => Promise<{ data: { data: T; pagination?: PaginationMeta } }>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to track whether the component is still mounted so we can
  // skip state updates after unmount (prevents the "setState on unmounted" warning).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (!mountedRef.current) return;
      setData(res.data.data);
      setPagination(res.data.pagination ?? null);
    } catch (e: unknown) {
      if (!mountedRef.current) return;
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, pagination, loading, error, refetch: fetch };
}