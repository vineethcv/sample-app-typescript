
# Docker & Compose

## Run the stack
```bash
docker compose -f docker/docker-compose.local.yml up --build -d
# web:  http://localhost:8080
# api:  http://localhost:3001
```

## Rebuild web with a different API URL
```bash
docker compose -f docker/docker-compose.local.yml build --no-cache web   --build-arg VITE_API_URL=http://api:3001
docker compose -f docker/docker-compose.local.yml up -d web
```

## Tear down
```bash
docker compose -f docker/docker-compose.local.yml down -v
```
