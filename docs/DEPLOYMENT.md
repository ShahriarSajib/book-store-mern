# Deployment

## Local development

```
# from project root
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env

docker compose up -d mongo          # optional, or run mongo locally
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:5000`.

## Docker

```
docker compose up --build
```

Brings up: `mongo`, `server`, `client` (dev mode with hot reload).

## Production

- Build server image: `docker build -t ai-bookstore-server ./server`
- Build client image: `docker build -t ai-bookstore-client ./client`
- Use a managed MongoDB (Atlas) or persistent volume
- Place behind a reverse proxy (nginx / Caddy) for TLS
- Configure real SMTP credentials and a real LLM API key in env

## Environment

Required server env (see `server/.env.example`):

```
NODE_ENV
PORT
MONGO_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
LLM_PROVIDER, LLM_API_KEY, LLM_MODEL
EMBEDDING_BACKEND, EMBEDDING_MODEL
VECTOR_BACKEND
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
```

Required client env (see `client/.env.example`):

```
VITE_API_BASE_URL
VITE_CHAT_STREAMING
```

## Jobs / scheduler

`server/src/jobs/scheduler.js` wires:

- `rebuildEmbeddings` — nightly full reindex
- `lowStockNotifier` — hourly check, email admin
- `expiringCoupons` — daily check, deactivate expired codes

## Observability

- `morgan` HTTP logs in dev
- `utils/logger.js` structured JSON in prod
- Centralized error handler returns sanitized payloads and logs full detail server-side