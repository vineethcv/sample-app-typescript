import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiProjects, type Project } from "../api/client";

export default function ProjectSwitcher() {
  const [sp, setSp] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const current = sp.get("projectId") || "";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await apiProjects();
        if (!mounted) return;
        setProjects(list);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onChange = (id: string) => {
    const next = new URLSearchParams(sp);
    next.set("projectId", id);
    // optional: clear pagination cursor-like params if you add them later
    setSp(next, { replace: true });
    localStorage.setItem("lastProjectId", id);
  };

  const value = useMemo(() => {
    if (current) return current;
    const last = localStorage.getItem("lastProjectId");
    if (last && projects.some(p => p.id === last)) return last;
    return projects[0]?.id ?? "";
  }, [current, projects]);

  if (loading) return <span style={{ fontSize: 12, opacity: 0.7 }}>Loading projects…</span>;
  if (err) return <span style={{ color: "crimson", fontSize: 12 }}>{err}</span>;
  if (!projects.length) return <span style={{ fontSize: 12, opacity: 0.7 }}>No projects</span>;

  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>Project:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: "4px 8px" }}
      >
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </label>
  );
}