import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLabels } from '../hooks/useLabels';

export function FilterBar({ projectId }: { projectId?: string }) {
  const [sp, setSp] = useSearchParams();
  const { labels } = useLabels(projectId);

  const status = sp.get('status') ?? '';
  const labelId = sp.get('labelId') ?? '';
  const search = sp.get('search') ?? '';

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    v ? next.set(k, v) : next.delete(k);
    setSp(next, { replace: true });
  };

  // ensure projectId is kept in the URL (useful when you add a project switcher)
  useEffect(() => {
    if (!projectId) return;
    const next = new URLSearchParams(sp);
    next.set('projectId', projectId);
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
      <label>
        Status:{' '}
        <select value={status} onChange={e => set('status', e.target.value)}>
          <option value="">All</option>
          <option value="Todo">Todo</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </label>

      <label>
        Label:{' '}
        <select value={labelId} onChange={e => set('labelId', e.target.value)}>
          <option value="">Any</option>
          {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </label>

      <input
        placeholder="Search title/description…"
        value={search}
        onChange={e => set('search', e.target.value)}
        style={{ flex: 1, padding: 6 }}
      />
    </div>
  );
}