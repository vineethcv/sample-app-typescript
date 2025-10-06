import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet, apiPatch } from '../api/client';
import type { Label } from './useLabels';

export type Task = {
  id: string; projectId: string; title: string; description?: string | null;
  status: 'Todo' | 'InProgress' | 'Done'; priority: 'Low' | 'Medium' | 'High';
  dueDate?: string | null; assigneeId?: string | null; labels: Label[]; createdAt: string; updatedAt: string; eTag: string;
};

export function useTasks(params: { projectId?: string; status?: string; labelId?: string; search?: string; limit?: number }) {
  const [items, setItems] = useState<Task[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const lastQuery = useRef<string>('');

  const buildQuery = () => {
    const q = new URLSearchParams();
    if (params.projectId) q.set('projectId', params.projectId);
    if (params.status) q.set('status', params.status);
    if (params.labelId) q.set('labelId', params.labelId);
    if (params.search) q.set('search', params.search);
    q.set('limit', String(params.limit ?? 20));
    return q.toString();
  };

  const load = useCallback(async (cursor?: string) => {
    if (!params.projectId) return;
    const q = buildQuery();
    // reset list when filters changed
    if (cursor === undefined && lastQuery.current !== q) {
      setItems([]); setNext(null);
    }
    lastQuery.current = q;
    setLoading(true); setError(null);
    try {
      const path = `/tasks?${q}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const data = await apiGet<{ items: Task[]; nextCursor: string | null }>(path);
      setItems(prev => cursor ? [...prev, ...data.items] : data.items);
      setNext(data.nextCursor);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }, [params.projectId, params.status, params.labelId, params.search, params.limit]);

  useEffect(() => { load(); }, [load]);

  const toggleDone = async (task: Task) => {
    const nextStatus = task.status === 'Done' ? 'Todo' : 'Done';
    const { data, etag, status, raw } = await apiPatch<Task>(`/tasks/${task.id}`, { status: nextStatus }, task.eTag);
    if (status === 409) {
      // server returns latest resource in body + ETag header
      const serverEtag = raw.headers.get('ETag') ?? task.eTag;
      setItems(list => list.map(t => t.id === task.id ? { ...(data as unknown as Task), eTag: serverEtag } : t));
      return false;
    }
    setItems(list => list.map(t => t.id === task.id ? { ...(data as Task), eTag: etag ?? task.eTag } : t));
    return true;
  };

  // ...existing code above...

  const removeById = (id: string) => {
    setItems(prev => prev.filter(t => t.id !== id));
  };

  const prepend = (task: Task) => {
    setItems(prev => [task, ...prev]);
  };

  const replace = (task: Task) => {
    setItems(prev => prev.map(t => (t.id === task.id ? task : t)));
  };

  return {
    items, next, loading, error,
    loadMore: () => next && load(next),
    toggleDone,
    // 👇 expose local mutation helpers for optimistic UI
    removeById,
    prepend,
    replace,
  };
}
