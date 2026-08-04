import { useCallback, useEffect, useState } from 'react';
import type { FplDataset } from '../types';
import { getDataset } from '../lib/fpl/provider';

export interface UseFplDataResult {
  dataset: FplDataset | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFplData(): UseFplDataResult {
  const [dataset, setDataset] = useState<FplDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (forceRefresh: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const ds = await getDataset({ forceRefresh });
      setDataset(ds);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { dataset, loading, error, refresh };
}
