# Architecture

## High-level

Monorepo with two services: `server/` (Express API) and `client/` (React + Vite). MongoDB is the system of record. The AI subsystem lives entirely in `server/src/ai/` and is the only path the LLM uses to reach data.

## Mandatory AI flow

```
User → Chatbot API → LLM → Tool Calling → Backend Service
     → Authorization / Business Logic → Database
     → Tool Result → LLM → User
```

The LLM never touches MongoDB. All read/write operations from the chatbot go through the same services the REST API uses, so business rules and authorization are enforced uniformly.

## Layers

| Layer | Responsibility |
|-------|----------------|
| Routes | HTTP wiring, method + path only |
| Controllers | Request/response shape, delegates to services |
| Services | Business logic, transactions, cross-cutting rules |
| Repositories | Thin DB access (Mongoose queries) |
| Models | Schemas, indexes, virtuals, hooks |
| AI subsystem | Embeddings, vector store, RAG, LLM, chatbot/tools, admin assistant, guardrails |
| Middleware | Auth, RBAC, validation, uploads, rate limiting, errors |
| Utils | AppError, logger, JWT, email, pagination |

## AI subsystem

- `embeddings/` — pluggable embedding provider (sentence-transformers or OpenAI)
- `vector/` — pluggable vector store (local cosine, Pinecone, Weaviate, Atlas Vector)
- `recommendation/` — semantic similarity, personalization, trending
- `rag/` — FAQ / policy retrieval-augmented answers
- `llm/` — LLM client, system prompts, tool JSON schemas (split read/write)
- `chatbot/` — multi-turn orchestrator + tool registry + 17 read/write tools
- `admin/` — Admin AI Assistant + 5 analytics tools
- `guardrails/` — tool policy, output filter, per-session rate limiter

## Security

- JWT access + refresh tokens, bcrypt password hashing
- RBAC middleware (`auth.js`, `admin.js`)
- Helmet, CORS allowlist, per-route rate limits
- Multer file upload with MIME + size validation
- Centralized error handler with sanitized payloads
- AI guardrails: role-based tool permissions, confirmation prompts for sensitive writes, PII redaction in LLM output, per-session token budget
