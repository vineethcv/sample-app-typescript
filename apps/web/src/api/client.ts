// apps/web/src/api/client.ts
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// 👇 This is the header we use for dev auth
const DEMO_HEADERS = { 'X-Demo-UserId': 'u_demo_1' }; 
//  Change to 'u_demo_2' to test Viewer role (403 on writes)

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',                 // <-- needed because CORS allows credentials
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...DEMO_HEADERS,                     // <-- our custom header goes here
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  etag?: string
): Promise<{ data: T; etag?: string; status: number; raw: Response }> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(etag ? { 'If-Match': etag } : {}),
      ...DEMO_HEADERS,                     // <-- also here
    },
    body: JSON.stringify(body),
  });
  const et = res.headers.get('ETag') ?? undefined;
  const data = await res.json();
  return { data, etag: et, status: res.status, raw: res };
}

export async function apiPost<T>(path: string, body: unknown): Promise<{ data: T; etag?: string }> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...DEMO_HEADERS,                     // <-- and here
    },
    body: JSON.stringify(body),
  });
  const et = res.headers.get('ETag') ?? undefined;
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`);
  return { data, etag: et };
}

export type Project = { id: string; name: string; createdAt: string };

export async function apiProjects(): Promise<Project[]> {
  return apiGet<Project[]>('/projects');
}