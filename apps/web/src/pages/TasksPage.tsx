import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { FilterBar } from '../components/FilterBar';
import { TaskList } from '../components/TaskList';
import { InfiniteScroll } from '../components/InfiniteScroll';
import ProjectSwitcher from '../components/ProjectSwitcher';
import KanbanBoard from '../kanban/KanbanBoard';
import { apiProjects } from '../api/client';

export default function TasksPage() {
  const [sp, setSp] = useSearchParams();
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState<'list' | 'board'>( (localStorage.getItem('viewMode') as 'list'|'board') || 'list' );

  // ensure ?projectId=
  useEffect(() => {
    (async () => {
      const current = sp.get('projectId');
      if (current) { setBooting(false); return; }
      const projects = await apiProjects();
      if (projects.length) {
        const last = localStorage.getItem('lastProjectId');
        const chosen = projects.find(p => p.id === last)?.id ?? projects[0].id;
        const next = new URLSearchParams(sp);
        next.set('projectId', chosen);
        setSp(next, { replace: true });
      }
      setBooting(false);
    })().catch(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projectId = sp.get('projectId') ?? undefined;
  const status    = sp.get('status') ?? undefined;
  const labelId   = sp.get('labelId') ?? undefined;
  const search    = sp.get('search') ?? undefined;

  useEffect(() => { if (projectId) localStorage.setItem('lastProjectId', projectId); }, [projectId]);
  useEffect(() => { localStorage.setItem('viewMode', mode); }, [mode]);

  const { items, next, loading, error, loadMore, toggleDone } =
    useTasks({ projectId, status, labelId, search, limit: 20 });

  const header = useMemo(() => (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Tasks</h2>
        <ProjectSwitcher />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setMode('list')}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: mode==='list' ? '#eef2ff' : 'white' }}
        >List</button>
        <button
          onClick={() => setMode('board')}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: mode==='board' ? '#eef2ff' : 'white' }}
        >Board</button>
      </div>
    </header>
  ), [mode]);

  if (booting) return <div className="container"><p>Loading project…</p></div>;

  return (
    <div className="container">
      {header}
      <FilterBar projectId={projectId} />
      {!!error && mode === 'list' && (
        <div style={{ color: 'crimson' }}>
          Error: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {mode === 'list' ? (
        <>
          <TaskList items={items} onToggle={toggleDone} />
          {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
          <InfiniteScroll hasMore={!!next} loadMore={loadMore} disabled={loading} />
        </>
      ) : (
        <KanbanBoard />
      )}
    </div>
  );
}