import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';

export type Label = { id: string; name: string; color: string };

export function useLabels(projectId: string | undefined) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Label[]>(`/labels?projectId=${encodeURIComponent(projectId)}`);
        setLabels(data);
      } catch (e) { setError(e); }
      finally { setLoading(false); }
    })();
  }, [projectId]);

  return { labels, loading, error };
}