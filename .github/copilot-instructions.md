## Quick orientation

This repository is a small TypeScript monorepo (npm workspaces + Turbo) containing two apps:

- `apps/api` — NestJS REST API (in-memory Task CRUD)
- `apps/web` — React + Vite Single Page App (consumes the API)

Key facts an automated coding agent should know up-front:

- Root workspace: `package.json` defines `workspaces: ["apps/*"]` and `turbo` tasks.
- API package name: `@app/api`. Web package name: `@app/web`.
- The SPA reads the backend base URL from `VITE_API_URL` (default `http://localhost:3001`). See `apps/web/src/main.tsx` for fetch examples.

## Big-picture architecture & data flow

- The SPA issues plain REST calls to the NestJS API. Example calls live in `apps/web/src/main.tsx` (GET `/tasks`, POST `/tasks`).
- API endpoints:
  - `GET /tasks` and `POST /tasks` — implemented by `apps/api/src/tasks/*` (controller, service, DTO).
  - `GET /health` — implemented in `apps/api/src/health.controller.ts`.
- The API uses an in-memory `TasksService` (`apps/api/src/tasks/tasks.service.ts`) — state is not persisted. This matters when writing or testing features: restart clears data.

## Important files to inspect when changing behavior

- Root: `package.json`, `tsconfig.base.json`, `turbo.json` — workspace and build orchestration.
- API: `apps/api/src/main.ts` (ValidationPipe, CORS config), `apps/api/src/tasks/*` (business logic), `apps/api/package.json` (scripts: `start:dev`, `build`, `test`).
- Web: `apps/web/src/main.tsx` (React entry + hooks using `@tanstack/react-query`), `apps/web/package.json` (Vite scripts and build).

## Dev & build workflows (concrete commands)

Use the workspace root to install and run tasks. Common commands:

```
# install (workspace root)
npm install

# start API in dev (watch)
npm --workspace=@app/api run start:dev

# start web dev server (Vite)
npm --workspace=@app/web run dev

# build everything (uses turbo/turborepo)
npm run build

# run tests across workspace
npm run test
```

Notes:
- `apps/api` dev server is Nest CLI (`nest start --watch`) — it uses the Nest CLI and ts-node flow.
- `tsc -b` is used for builds (project references). After changing exported types or tsconfig references run `npm --workspace=@app/api run build` or `npm --workspace=@app/web run build` as appropriate.

## Project-specific conventions & patterns

- Monorepo + npm workspaces: prefer `npm --workspace=<pkg>` when targeting a single package.
- TypeScript builds use `tsc -b` (project references). Avoid bypassing `tsc -b` when adding new tsconfig references.
- DTO + validation on server: `class-validator` + `ValidationPipe({ whitelist: true, transform: true })` is enabled in `apps/api/src/main.ts`. Keep DTOs (e.g. `CreateTaskDto`) strict — server will strip unknown properties.
- Minimal API: state is in-memory — tests and dev assumptions should not expect persistence.

## Integration points / dependencies to watch

- Server: `class-validator`, `class-transformer`, `reflect-metadata`. Ensure `reflect-metadata` is imported once (it's imported in `apps/api/src/main.ts`).
- Client: `@tanstack/react-query` for data fetching and caching. Look at `useQuery` / `useMutation` usage in `apps/web/src/main.tsx` for examples of invalidation (`invalidateQueries(['tasks'])`).

## When making edits — short checklist for an AI agent

1. Identify which package changes (api vs web). Use `npm --workspace=...` for local runs.
2. Update TypeScript types and run `tsc -b` for that package.
3. If API surface changes, update client fetch calls and the DTOs. Run both dev servers to smoke-test.
4. Run package tests: `npm --workspace=@app/api run test` (API has Jest config). Top-level `npm run test` invokes turbo.

## Examples (quick pointers)

- Create task flow: client POST to `${VITE_API_URL}/tasks` with JSON { title }, server `CreateTaskDto` requires `title: string` (`apps/api/src/tasks/dto/create-task.dto.ts`).
- Validation: server uses `ValidationPipe({ whitelist: true, transform: true })` — incoming payloads are transformed to DTO class instances and extra fields removed (`apps/api/src/main.ts`).

## Limits & what this file does not cover

- No database, no auth, and no CI-specific steps are present in the repo. If you need to add persistence or CI, follow repo layout with new workspace packages under `apps/` or `packages/` and update `tsconfig`/`turbo.json` accordingly.

---

If anything above is unclear or you'd like me to expand any section (example PR checklist, common refactors, or test guidance), tell me which part to iterate on.
