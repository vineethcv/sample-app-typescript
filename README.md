
# sample-app-typescript — Part 1: App & API

This part includes the **React+Vite SPA** and **NestJS API** with a simple in-memory Task CRUD.

## Quick Start (Dev)

```bash
# install (workspace root)
npm install

# start API (http://localhost:3001)
npm --workspace=@app/api run start:dev

# in another terminal start SPA (http://localhost:5173)
npm --workspace=@app/web run dev
```

> The SPA reads API url from `VITE_API_URL` (defaults to `http://localhost:3001`).
