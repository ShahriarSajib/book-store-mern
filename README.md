# Server (Express API)

```
src/
├── config/        env, db, ai provider config
├── models/        Mongoose schemas
├── repositories/  thin DB access layer
├── controllers/   HTTP layer (thin)
├── routes/        Express routers
├── services/      business logic (auth, books, orders, etc.)
├── middleware/    auth, admin, validate, upload, errorHandler, ...
├── validators/    express-validator chains
├── utils/         AppError, jwt, logger, email, paginate
├── jobs/          scheduled tasks
├── ai/
│   ├── embeddings/    pluggable embedding providers
│   ├── vector/        pluggable vector store backends
│   ├── recommendation/ similar/personalized/trending
│   ├── rag/           FAQ retrieval-augmented generation
│   ├── llm/           LLM client, prompts, tool schema
│   ├── chatbot/       orchestrator + read/write tools
│   ├── admin/         Admin AI Assistant + tools
│   └── guardrails/    tool policy, output filter, rate limit
└── server.js      entry point
```

## AI architecture (mandatory flow)

```
User → Chatbot API → LLM → Tool Calling → Backend Service
      → Authorization / Business Logic → Database
      → Tool Result → LLM → User
```

The LLM never touches MongoDB directly.

## Run

```
cp .env.example .env
npm install
npm run dev
```
