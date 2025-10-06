import { Task } from '../hooks/useTasks';

export function TaskList({ items, onToggle }: { items: Task[]; onToggle: (t: Task) => void }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
      {items.map(t => (
        <li key={t.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button title="toggle done" onClick={() => onToggle(t)} style={{ fontSize: 18 }}>
              {t.status === 'Done' ? '✅' : '⬜️'}
            </button>
            <strong>{t.title}</strong>
            <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>{t.priority}</span>
          </div>
          {!!t.labels?.length && (
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {t.labels.map(l => (
                <span key={l.id} style={{ border: `1px solid ${l.color}`, padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}