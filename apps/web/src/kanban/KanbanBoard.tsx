import { useSearchParams } from "react-router-dom";
import { useTasks, Task } from "../hooks/useTasks";
import { apiPatch } from "../api/client";

type LaneKey = "Todo" | "InProgress" | "Done";

const LANES: { key: LaneKey; title: string }[] = [
  { key: "Todo", title: "Todo" },
  { key: "InProgress", title: "In Progress" },
  { key: "Done", title: "Done" },
];

export default function KanbanBoard() {
  const [sp] = useSearchParams();
  const projectId = sp.get("projectId") ?? undefined;
  const labelId = sp.get("labelId") ?? undefined;
  const search = sp.get("search") ?? undefined;

  const todo = useTasks({ projectId, status: "Todo", labelId, search, limit: 50 });
  const inprogress = useTasks({ projectId, status: "InProgress", labelId, search, limit: 50 });
  const done = useTasks({ projectId, status: "Done", labelId, search, limit: 50 });

  const lanes: Record<LaneKey, typeof todo> = {
    Todo: todo,
    InProgress: inprogress,
    Done: done,
  };

  async function moveTask(task: Task, to: LaneKey) {
    const from: LaneKey = task.status as LaneKey;
    if (from === to) return;

    // 1) optimistic: remove from old lane, add to new lane
    lanes[from].removeById(task.id);
    lanes[to].prepend({ ...task, status: to });

    // 2) server update with ETag
    const { data, etag, status } = await apiPatch<Task>(`/tasks/${task.id}`, { status: to }, task.eTag);

    if (status === 409) {
      // 3a) conflict: remove optimistic copy from target, then insert the server copy into the correct lane
      lanes[to].removeById(task.id);
      const server = data as Task;
      const correctLane = server.status as LaneKey;
      lanes[correctLane].prepend({ ...server, eTag: etag ?? server.eTag });
      return;
    }

    // 3b) success: ensure target lane has server-confirmed copy with fresh ETag
    lanes[to].replace({ ...(data as Task), eTag: etag ?? task.eTag });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, alignItems: "start" }}>
      {LANES.map((l) => (
        <Lane
          key={l.key}
          title={l.title}
          tasks={lanes[l.key].items}
          loading={lanes[l.key].loading}
          hasMore={!!lanes[l.key].next}
          onLoadMore={lanes[l.key].loadMore}
          onDropTask={(t) => moveTask(t, l.key)}
        />
      ))}
    </div>
  );
}

function Lane({ title, tasks, loading, hasMore, onLoadMore, onDropTask }: {
  title: string;
  tasks: Task[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDropTask: (t: Task) => void;
}) {
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const payload = e.dataTransfer.getData("application/json");
    if (!payload) return;
    onDropTask(JSON.parse(payload) as Task);
  }

  return (
    <div onDragOver={onDragOver} onDrop={onDrop}
      style={{ background: "#f5f5f7", border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, minHeight: 300 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>{title}</strong>
        <small style={{ opacity: 0.7 }}>{tasks.length}</small>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {tasks.map((t) => <Card key={t.id} task={t} />)}
      </div>

      {loading && <p style={{ opacity: 0.6, marginTop: 8 }}>Loading…</p>}
      {hasMore && !loading && <button onClick={onLoadMore} style={{ marginTop: 8, width: "100%" }}>Load more</button>}
    </div>
  );
}

function Card({ task }: { task: Task }) {
  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify(task));
  }
  return (
    <div draggable onDragStart={onDragStart}
      style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, cursor: "grab" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 12, padding: "2px 6px", borderRadius: 6, background: "#eef2ff" }}>{task.priority}</span>
        <strong style={{ fontWeight: 600 }}>{task.title}</strong>
      </div>
      {!!task.labels?.length && (
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {task.labels.map(l => (
            <span key={l.id} style={{ border: `1px solid ${l.color}`, borderRadius: 6, padding: "2px 6px", fontSize: 12 }}>
              {l.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}