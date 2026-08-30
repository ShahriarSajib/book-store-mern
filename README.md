# BookVerse — AI-Powered MERN Bookstore

A production-grade online bookstore built on the MERN stack. Semantic search, personalized recommendations, a tool-calling AI assistant, Stripe payments, real-time notifications, and a complete admin panel — all behind a responsive Tailwind UI.

**Live demo:** https://book-store-mern.vercel.app
**Repository:** https://github.com/ShahriarSajib/book-store-mern

---

## Highlights

- **AI-native catalog** — semantic search (`all-MiniLM-L6-v2` embeddings, 384-dim), similarity recommendations, multi-factor personalized ranking, trending algorithm.
- **Tool-calling chatbot** — 18 read/write tools (search, cart, wishlist, orders), LLM-driven with regex fallback path and confirmation-gated writes.
- **RAG** — FAQ knowledge base retrieved and injected into the LLM prompt for grounded answers.
- **Payments** — Stripe Checkout + webhooks, **bKash Tokenized Checkout** (sandbox/prod), and cash-on-delivery fallback. Refunds supported for card and bKash.
- **Real-time** — Socket.IO rooms (`user:{id}`, `admin`, `inventory`) for orders, payments, and stock alerts.
- **Role-based access** — `customer`, `book_manager`, `order_manager`, `admin` with middleware-enforced permissions.
- **Background jobs** — low-stock notifier, expiring-coupon sweeper, on-demand embedding rebuild.
- **Admin AI assistant** — chat interface over sales, inventory, and operations.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Database](#database)
- [Running Locally](#running-locally)
- [Docker](#docker)
- [Seeding Data](#seeding-data)
- [Authentication & RBAC](#authentication--rbac)
- [Customer Experience](#customer-experience)
- [Admin Experience](#admin-experience)
- [AI & Recommendations](#ai--recommendations)
- [Real-Time Events](#real-time-events)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Background Jobs](#background-jobs)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Architecture

```
┌────────────────────┐     HTTPS / WSS     ┌────────────────────────┐
│  React + Vite SPA  │ ───────────────────▶│  Express + Socket.IO   │
│  (port 5173)       │                     │  (port 5001)           │
└────────────────────┘                     │  ├── REST API          │
                                           │  ├── Socket.IO server  │
                                           │  ├── Jobs (scheduler)  │
                                           │  ├── AI services       │
                                           │  │   ├── embeddings    │
                                           │  │   ├── vector store  │
                                           │  │   ├── recommender   │
                                           │  │   ├── chatbot       │
                                           │  │   └── admin AI      │
                                           │  └── Stripe webhooks   │
                                           └──────────┬─────────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────┐
                                            │   MongoDB 7      │
                                            └──────────────────┘
```

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | React 18, Vite 5, React Router 6, TanStack Query 5 |
| Styling      | Tailwind CSS 3 (custom palette) |
| Forms        | React Hook Form + Zod |
| HTTP         | Axios with auto-refresh interceptor |
| Real-time    | Socket.IO client |
| Charts       | Recharts |
| Backend      | Node.js, Express 4, Mongoose 8 |
| Database     | MongoDB 7 |
| Auth         | JWT (access + refresh), bcrypt |
| Email        | Nodemailer (SMTP) |
| AI           | `@xenova/transformers` (local MiniLM), OpenAI-compatible LLM |
| Payments     | Stripe Checkout + Webhooks, bKash Tokenized Checkout |
| Upload       | Multer (disk) + Sharp |
| Security     | Helmet, CORS, express-rate-limit, express-validator |
| Container    | Docker + Docker Compose |
| Tests        | Jest + Supertest |

---

## Project Structure

```
book-store-mern/
├── client/                           # React + Vite SPA (port 5173)
│   └── src/
│       ├── ai/                       # AI feature module (search, rec, chat)
│       ├── components/
│       │   ├── books/                # BookCard, BookGrid, BookFilters, SearchBar
│       │   ├── cart/                 # CartItem, CartSummary, CouponInput
│       │   ├── chatbot/              # ChatbotWidget, ChatWindow, MessageBubble
│       │   ├── layout/               # Navbar, Footer, Sidebar
│       │   ├── recommendations/      # SimilarBooks, TrendingBooks, ForYou
│       │   ├── reviews/              # ReviewList, ReviewForm, RatingStars
│       │   └── ui/                   # Button, Input, Modal, Skeleton, etc.
│       ├── config/                   # api.js, constants.js
│       ├── context/                  # Auth, Cart, Chatbot, Toast
│       ├── features/                 # Per-domain logic (admin, auth, books…)
│       ├── hooks/                    # useAuth, useCart, useSearch, etc.
│       ├── pages/
│       │   ├── admin/                # 13 admin pages
│       │   ├── auth/                 # Login, Register, Verify, Reset
│       │   ├── chatbot/              # Full-page chat
│       │   ├── customer/             # Cart, Checkout, Orders, Wishlist…
│       │   └── public/               # Home, Books, BookDetails, Search
│       ├── routes/                   # AppRouter, ProtectedRoute, AdminRoute
│       ├── services/                 # Axios + 14 API modules
│       ├── styles/                   # index.css (Tailwind + custom layers)
│       └── utils/                    # cn, format, validation
│
├── server/                           # Express API (port 5001)
│   └── src/
│       ├── ai/
│       │   ├── admin/                # Admin AI assistant
│       │   ├── chatbot/              # Orchestrator + tools
│       │   ├── embeddings/           # MiniLM service
│       │   ├── guardrails/           # Tool policy, output filter, rate limit
│       │   ├── llm/                  # LLM client, prompts, tool schemas
│       │   ├── rag/                  # FAQ retrieval
│       │   ├── recommendation/       # Similar / personalized / trending
│       │   └── vector/               # Cosine similarity backend
│       ├── config/                   # env.js, db.js, ai.js
│       ├── controllers/              # HTTP handlers
│       ├── jobs/                     # Scheduled jobs
│       ├── middleware/               # Auth, RBAC, validation, upload, errors
│       ├── models/                   # 16 Mongoose models
│       ├── repositories/             # DB access layer
│       ├── routes/                   # Express routers
│       ├── scripts/                  # seedAdmin, seedBooks, seedFaq
│       ├── services/                 # Business logic
│       ├── utils/                    # AppError, JWT, logger, email, paginate
│       └── validators/               # express-validator chains
│
├── docker-compose.yml
└── package.json
```

---

## Getting Started

### Prerequisites

| Tool    | Version  | Verify         |
|---------|----------|----------------|
| Node.js | ≥ 18     | `node -v`      |
| npm     | ≥ 9      | `npm -v`       |
| MongoDB | 7.x      | Local, Docker, or Atlas |
| Git     | any      | `git --version`|

### Install

```bash
git clone https://github.com/ShahriarSajib/book-store-mern.git
cd book-store-mern

# Server
cd server && npm install

# Client
cd ../client && npm install

# Root (optional, for convenience scripts)
cd .. && npm install
```

---

## Configuration

Create env files from the templates.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Server — `server/.env`

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Runtime mode |
| `PORT` | `5001` | API port |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |
| `MONGO_URI` | `mongodb://localhost:27017/bookverse` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | — | Access token signing key |
| `JWT_REFRESH_SECRET` | — | Refresh token signing key |
| `JWT_ACCESS_EXPIRES` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES` | `7d` | Refresh token TTL |
| `BCRYPT_SALT_ROUNDS` | `12` | Password hashing cost |
| `UPLOAD_DIR` | `uploads` | Static file root |
| `MAX_UPLOAD_MB` | `5` | Max upload size |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` / `MAIL_FROM` | — | SMTP creds |
| `LLM_PROVIDER` | `openai` | `openai` or `custom` |
| `LLM_API_KEY` | — | Chatbot LLM key |
| `LLM_MODEL` | `gpt-4o-mini` | Chatbot model |
| `LLM_BASE_URL` | — | Override for OpenAI-compatible providers |
| `EMBEDDING_PROVIDER` | `sentence-transformers` | Embedding backend |
| `EMBEDDING_MODEL` | `Xenova/all-MiniLM-L6-v2` | Embedding model id |
| `EMBEDDING_DIM` | `384` | Vector dimension |
| `PAYMENT_PROVIDER` | `stripe` | Payment backend |
| `STRIPE_SECRET_KEY` | — | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | — | Webhook signing secret |
| `BKASH_BASE_URL` | `https://tokenized.sandbox.bka.sh/v1.2.0-beta` | bKash tokenized checkout base URL (prod: `https://tokenized.pay.bka.sh/v1.2.0-beta`) |
| `BKASH_APP_KEY` / `BKASH_APP_SECRET` | — | bKash merchant app credentials |
| `BKASH_USERNAME` / `BKASH_PASSWORD` | — | bKash merchant panel credentials |
| `BKASH_EXCHANGE_RATE_BDT_PER_USD` | `110` | USD→BDT rate; bKash only accepts integer BDT amounts |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | — | Seed admin credentials |
| `LOW_STOCK_JOB_INTERVAL_MS` | `1800000` | Low-stock job (30 min) |
| `EXPIRING_COUPONS_JOB_INTERVAL_MS` | `3600000` | Coupon sweeper (1 hr) |
| `LOW_STOCK_THRESHOLD` | `5` | Books at/below this trigger alerts |

### Client — `client/.env`

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:5001/api` | API base |
| `VITE_CHAT_STREAMING` | `true` | Stream chatbot replies |
| `VITE_SOCKET_URL` | `http://localhost:5001` | Socket.IO endpoint |

---

## Database

Pick one of:

1. **Local** — install MongoDB 7 and run it on `mongodb://localhost:27017`.
2. **Docker** — `docker compose up -d mongo` (root user `admin`/`admin`).
3. **Atlas** — create a free M0 cluster, whitelist your IP, set `MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/bookverse`.

---

## Running Locally

Open two terminals.

**Terminal 1 — Backend (port 5001):**

```bash
cd server
npm run dev          # nodemon src/server.js
# Verify: curl http://localhost:5001/api/health  →  {"ok":true}
```

**Terminal 2 — Frontend (port 5173):**

```bash
cd client
npm run dev
```

Open http://localhost:5173.

---

## Docker

Full stack:

```bash
docker compose up --build
```

| Service  | Port  | Notes                    |
|----------|-------|--------------------------|
| `mongo`  | 27017 | Auth: `admin` / `admin`  |
| `server` | 5001  | Express API              |
| `client` | 5173  | Vite dev server          |

---

## Seeding Data

```bash
cd server

# Seed admin user (uses ADMIN_EMAIL and ADMIN_PASSWORD from .env)
npm run seed:admin

# Seed sample books
npm run seed:books

# Seed FAQ knowledge base
node scripts/seedFaq.js
```

---

## Authentication & RBAC

### Registration
1. `POST /api/auth/register` → bcrypt hash (12 rounds) + verification token (SHA-256, 24h)
2. Verification email with link to `GET /api/auth/verify-email/:token`
3. Account becomes login-eligible once verified

### Login
1. `POST /api/auth/login` → returns access (15m) + refresh (7d) tokens
2. Access stored in memory, refresh in `localStorage`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. On `401`, interceptor silently refreshes and retries

### Password Reset
1. `POST /api/auth/forgot-password` → 1h reset token via email
2. `POST /api/auth/reset-password { token, password }` → invalidates prior refresh tokens

### Roles

| Role           | Permissions |
|----------------|-------------|
| `customer`     | Browse, search, cart, checkout, orders, reviews, wishlist, chatbot |
| `book_manager` | Customer + books, categories, authors, publishers, inventory |
| `order_manager`| Customer + order management |
| `admin`        | All features including users, coupons, analytics, AI assistant |

Middleware: `protect`, `requireVerified`, `requireAdmin`, `restrictTo(...roles)`.

---

## Customer Experience

### Browse & Search
- **Home** (`/`) — hero, featured, trending, personalized rails
- **Catalog** (`/books`) — filters (category, author, price), sort, pagination
- **Book details** (`/books/:id`) — cover, authors, description, reviews, similar books
- **Search** (`/search`) — keyword + autocomplete (min 2 chars)
- **Semantic search** (`/ai-search`) — natural language over embeddings

### Recommendations
- **Similar** — cosine similarity on book embeddings
- **Personalized** (`/recommended`) — multi-factor score (genre +5, author +4, liked similarity +6, viewed similarity +2, rating, popularity)
- **Trending** (`/trending`) — composite score: `purchases×10 + views×1 + searches×3 + rating×5 + recentActivity×5`
- **Recently viewed** — pulled from `browseHistory`

### Cart & Checkout
1. Add to cart from any book page
2. Cart icon shows count badge
3. `/cart` — adjust quantities, apply coupon (percent/fixed)
4. `/checkout` — shipping address + payment method:
   - **Stripe Card** → redirect to hosted checkout, webhook confirms
   - **bKash** → one-time wallet linking (agreement, OTP) → bKash's secure checkout → server verifies via Execute + Query Payment and confirms
   - **Cash on Delivery** → order created immediately, stock decremented
5. Stock validation gates order creation

### Orders
- `/orders` — list with status + total
- `/orders/:id` — items, address, status timeline, payment status
- `/orders/:id/tracking` — step progress (Pending → Confirmed → Processing → Shipped → Delivered)
- Cancel (pending/confirmed/processing) restores stock
- Reorder pushes items back into cart
- CSV invoice download

### Reviews & Wishlist
- One review per user per book, 1–5 stars + body
- Admin approval workflow
- Wishlist supports add/remove and move-to-cart

### AI Chatbot
- Floating widget (bottom-right) + full-page chat (`/chat`)
- 18 tools, regex fallback when LLM is offline
- Confirmation flow for write actions (cancel order)
- Conversation history persisted, auto-titled

### Notifications
- Real-time toasts via Socket.IO
- Persistent storage with types: `order`, `order_status`, `payment`, `promotion`, `system`, `stock`
- Mark read / clear all, with per-category preferences

---

## Admin Experience

### Sections

| Section        | URL                       | Purpose |
|----------------|---------------------------|---------|
| Dashboard      | `/admin`                  | KPI overview + recent activity |
| Users          | `/admin/users`            | Search, role, status, delete |
| Books          | `/admin/books`            | Full CRUD + cover upload |
| Categories     | `/admin/categories`       | CRUD + active toggle |
| Authors        | `/admin/authors`          | CRUD + active toggle |
| Publishers     | `/admin/publishers`       | CRUD + active toggle |
| Orders         | `/admin/orders`           | Status updates + refunds |
| Inventory      | `/admin/inventory`        | Inline stock editing |
| Reviews        | `/admin/reviews`          | Approve / unapprove / delete |
| Coupons        | `/admin/coupons`          | Percent / fixed, expiry, limits |
| Analytics      | `/admin/analytics`        | Sales / inventory / rec tabs |
| Recommendations| `/admin/recommendations`  | Embedding health + logs |
| AI Assistant   | `/admin/ai`               | Operations chat |

### Analytics
- **Sales** — revenue over time, top sellers, status breakdown
- **Inventory** — total stock, low/out-of-stock counts and lists
- **Recommendations** — top rated, top purchased, review stats

### Recommendation Tuning
- **Overview** — embedding coverage, log stats, unique users
- **Embeddings** — queue regeneration per-book or in bulk
- **Most Recommended / Most Clicked** — 7/30/90 day windows
- **Logs** — raw recommendation log entries

### Admin AI Assistant
Chat interface that calls operational tools (sales reports, low stock lists, user counts).

---

## AI & Recommendations

### Embeddings & Semantic Search
- **Provider:** `Xenova/all-MiniLM-L6-v2` via `@xenova/transformers` (runs locally)
- **Dimension:** 384
- **Pipeline:** title + description → embedding → cosine similarity → top-K

### Similarity Recommendations
1. Lookup source book's embedding
2. Cosine similarity against all books
3. Return top-K above threshold

### Personalized Scoring

| Signal                  | Weight |
|-------------------------|--------|
| Favorite genre match    | +5     |
| Author match            | +4     |
| Liked book similarity   | +6     |
| Viewed book similarity  | +2     |
| Book rating             | bonus  |
| Popularity              | bonus  |

### Chatbot Architecture

```
User Message → Orchestrator
   ├── Intent (regex fallback)
   │   ├── FAQ search
   │   ├── Book search
   │   ├── Cart ops
   │   ├── Order ops
   │   └── Wishlist ops
   └── LLM path (when configured)
       ├── System prompt + 18 tool schemas
       ├── Tool call → backend service → DB
       ├── Result → LLM → reply
       └── Guardrails: role gates, confirmation tokens, PII redaction, per-session rate limit
```

### RAG
FAQ documents are embedded and stored in the vector backend. User questions retrieve top-K context that is injected into the LLM prompt for grounded answers.

---

## Real-Time Events

Socket.IO rooms:

| Room           | Audience                                 |
|----------------|------------------------------------------|
| `user:{id}`    | Single user                              |
| `admin`        | admin + book_manager + order_manager     |
| `inventory`    | admin + book_manager                     |

Events:

| Event                | Target                  | Trigger |
|----------------------|-------------------------|---------|
| `order:created`      | user + admins           | Order placed |
| `order:statusChanged`| user + admins           | Status update |
| `order:cancelled`    | user + admins           | Order cancelled |
| `payment:confirmed`  | user + admins           | Stripe success |
| `payment:failed`     | user                    | Stripe failure |
| `payment:expired`    | user                    | Session expired |
| `stock:updated`      | inventory               | Stock changed |
| `stock:low`          | admin + inventory       | Below threshold |

---

## API Reference

Base URL: `http://localhost:5001/api`

### Auth

| Method | Endpoint                     | Auth         | Description |
|--------|------------------------------|--------------|-------------|
| POST   | `/auth/register`             | Public       | Register |
| POST   | `/auth/login`                | Public       | Login |
| POST   | `/auth/refresh`              | Public       | Refresh access token |
| POST   | `/auth/logout`               | Public       | Logout |
| POST   | `/auth/forgot-password`      | Public       | Request reset email |
| POST   | `/auth/reset-password`       | Public       | Reset password |
| GET    | `/auth/verify-email/:token`  | Public       | Verify email |
| POST   | `/auth/resend-verification`  | Public       | Resend verification |
| GET    | `/auth/me`                   | Auth         | Current user |
| PUT    | `/auth/me`                   | Auth         | Update profile |
| PUT    | `/auth/me/password`          | Auth         | Change password |

### Books

| Method | Endpoint        | Auth  | Description |
|--------|-----------------|-------|-------------|
| GET    | `/books`        | Public| List (paginated, filterable) |
| GET    | `/books/:id`    | Public| Details |
| POST   | `/books`        | Admin | Create |
| PUT    | `/books/:id`    | Admin | Update |
| DELETE | `/books/:id`    | Admin | Delete |

### Catalog

| Method | Endpoint              | Auth  |
|--------|-----------------------|-------|
| GET    | `/categories`         | Public |
| POST   | `/categories`         | Admin |
| PUT    | `/categories/:id`     | Admin |
| DELETE | `/categories/:id`     | Admin |
| GET    | `/authors`            | Public |
| POST   | `/authors`            | Admin |
| PUT    | `/authors/:id`        | Admin |
| DELETE | `/authors/:id`        | Admin |
| GET    | `/publishers`         | Public |
| POST   | `/publishers`         | Admin |
| PUT    | `/publishers/:id`     | Admin |
| DELETE | `/publishers/:id`     | Admin |

### Search

| Method | Endpoint                          | Description |
|--------|-----------------------------------|-------------|
| GET    | `/search?q=`                       | Keyword search |
| GET    | `/search/autocomplete?q=`          | Title autocomplete (min 2 chars) |
| GET    | `/semantic-search?q=`              | AI semantic search |

### Recommendations

| Method | Endpoint                                 | Auth      |
|--------|------------------------------------------|-----------|
| GET    | `/recommendations/similar/:bookId`       | Public    |
| GET    | `/recommendations/personalized`          | Auth      |
| GET    | `/recommendations/trending`              | Public    |
| GET    | `/recommendations/recently-viewed`       | Auth      |

### Cart

| Method | Endpoint             | Auth   |
|--------|----------------------|--------|
| GET    | `/cart`              | Auth   |
| POST   | `/cart`              | Auth   |
| PUT    | `/cart/:bookId`      | Auth   |
| DELETE | `/cart/:bookId`      | Auth   |
| DELETE | `/cart`              | Auth   |
| POST   | `/cart/coupon`       | Auth   |
| DELETE | `/cart/coupon`       | Auth   |

### Orders

| Method | Endpoint                  | Auth     |
|--------|---------------------------|----------|
| POST   | `/orders`                 | Verified |
| GET    | `/orders`                 | Auth     |
| GET    | `/orders/:id`             | Auth     |
| GET    | `/orders/:id/tracking`    | Auth     |
| GET    | `/orders/:id/invoice`     | Auth     |
| PUT    | `/orders/:id/cancel`      | Verified |
| POST   | `/orders/:id/reorder`     | Verified |

### Payments

| Method | Endpoint                              | Auth      | Description |
|--------|---------------------------------------|-----------|-------------|
| POST   | `/payments/create-checkout-session`   | Auth      | Stripe session |
| GET    | `/payments/config`                    | Public    | Stripe publishable key |
| POST   | `/payments/webhook`                   | Public    | Stripe webhook (raw body) |
| POST   | `/payments/bkash/create`              | Auth      | Create bKash payment → `{ paymentID, url }`; starts agreement flow if no wallet linked | 
| GET    | `/payments/bkash/callback`            | Public    | bKash payment redirect target; verifies via Execute + Query, confirms |
| POST   | `/payments/bkash/status`              | Auth      | Verify/confirm by `paymentID` (Query Payment) |
| POST   | `/payments/bkash/execute`             | Auth      | ExecuteButton flow |
| POST   | `/payments/bkash/agreement`           | Auth      | Start one-time wallet linking → `{ paymentID, url }` |
| GET    | `/payments/bkash/agreement`           | Auth      | Whether the user has a linked bKash wallet |
| DELETE | `/payments/bkash/agreement`           | Auth      | Unlink the stored bKash agreement |
| GET    | `/payments/bkash/agreement/callback`  | Public    | bKash agreement redirect target; executes + stores agreementID |

### Reviews

| Method | Endpoint                       | Auth         |
|--------|--------------------------------|--------------|
| GET    | `/reviews/book/:bookId`        | Public       |
| POST   | `/reviews`                     | Auth         |
| PUT    | `/reviews/:id`                 | Owner        |
| DELETE | `/reviews/:id`                 | Owner / Admin|

### Coupons

| Method | Endpoint                  | Auth   |
|--------|---------------------------|--------|
| POST   | `/coupons/validate`       | Auth   |

### Chatbot

| Method | Endpoint          | Auth  |
|--------|-------------------|-------|
| POST   | `/chat`           | Auth  |
| GET    | `/chat/history`   | Auth  |
| DELETE | `/chat/history`   | Auth  |
| POST   | `/chat/confirm`   | Auth  |

### Notifications

| Method | Endpoint                              | Auth  |
|--------|---------------------------------------|-------|
| GET    | `/notifications`                      | Auth  |
| PUT    | `/notifications/:id/read`             | Auth  |
| PUT    | `/notifications/read-all`             | Auth  |
| DELETE | `/notifications/:id`                  | Auth  |
| DELETE | `/notifications`                      | Auth  |
| GET    | `/notifications/preferences`          | Auth  |
| PUT    | `/notifications/preferences`          | Auth  |

### Admin

| Method | Endpoint                                              | Auth  |
|--------|-------------------------------------------------------|-------|
| GET    | `/admin/dashboard`                                    | Admin |
| GET    | `/admin/users`                                        | Admin |
| GET    | `/admin/users/:id`                                    | Admin |
| PUT    | `/admin/users/:id`                                    | Admin |
| DELETE | `/admin/users/:id`                                    | Admin |
| GET    | `/admin/inventory`                                    | Admin |
| PUT    | `/admin/inventory/:id`                                | Admin |
| GET    | `/admin/reviews`                                      | Admin |
| PUT    | `/admin/reviews/:id`                                  | Admin |
| DELETE | `/admin/reviews/:id`                                  | Admin |
| GET    | `/admin/coupons`                                      | Admin |
| POST   | `/admin/coupons`                                      | Admin |
| PUT    | `/admin/coupons/:id`                                  | Admin |
| DELETE | `/admin/coupons/:id`                                  | Admin |
| GET    | `/admin/orders`                                       | Admin |
| PUT    | `/admin/orders/:id`                                   | Admin |
| POST   | `/admin/orders/:id/refund`                            | Admin |
| GET    | `/admin/analytics/sales`                              | Admin |
| GET    | `/admin/analytics/inventory`                          | Admin |
| GET    | `/admin/analytics/recommendations`                    | Admin |
| GET    | `/admin/recommendations/summary`                      | Admin |
| GET    | `/admin/recommendations/embeddings`                   | Admin |
| POST   | `/admin/recommendations/embeddings/regenerate`        | Admin |
| GET    | `/admin/recommendations/most-recommended`             | Admin |
| GET    | `/admin/recommendations/most-clicked`                 | Admin |
| GET    | `/admin/recommendations/logs`                         | Admin |
| POST   | `/admin/ai/chat`                                      | Admin |

### Uploads

| Method | Endpoint           | Auth  | Description |
|--------|--------------------|-------|-------------|
| POST   | `/upload/image`    | Admin | JPEG/PNG/WebP/GIF/SVG, max 5 MB |

---

## Database Schema

| Collection          | Key Fields | Purpose |
|---------------------|------------|---------|
| `users`             | name, email, password, role, isActive, isEmailVerified, addresses[], browseHistory[], searchHistory[], favoriteGenres[], notificationPreferences | Accounts + RBAC + personalization |
| `books`             | title, slug, subtitle, authors[], categories[], publisher, language, isbn10/isbn13, coverImage, description, publishedYear, pages, price, stock, tags[], averageRating, reviewCount, viewCount, purchaseCount, embeddingId | Catalog with embeddings |
| `categories`        | name, slug, description, isActive | Taxonomy |
| `authors`           | name, bio, image, bornYear, country, isActive | Author profiles |
| `publishers`        | name, slug, country, website, isActive | Publisher profiles |
| `carts`             | user, items[{book, quantity, price}], coupon | Per-user cart |
| `orders`            | orderNumber, user, items[], coupon, subtotal, shipping, tax, total, status, paymentStatus, paymentMethod, stripeSessionId, stripePaymentIntentId, bkashPaymentId, bkashTrxId, shippingAddress, trackingNumber | Orders |
| `reviews`           | book, user, rating, title, body, helpfulCount, isApproved | Per-user-per-book reviews |
| `coupons`           | code, type, value, minOrder, maxDiscount, expiresAt, usageLimit, usedCount, isActive | Discount codes |
| `conversations`     | user, title, messages[{role, content, books[], tool{}}] | Chat history |
| `faqdocuments`      | question, answer, category, keywords[], embeddingId | RAG knowledge base |
| `notifications`     | user, type, title, message, read, link, data{} | Persistent notifications |
| `wishlists`         | user, items[{book, addedAt}] | Saved-for-later |
| `userpreferences`   | userId, favoriteGenres[], favoriteAuthors[], viewedBooks[], likedBooks[] | Personalization |
| `recommendationlogs`| userId, bookId, score, reason | Rec tracking |
| `popularityrecords` | bookId (unique), views, purchases, searches, recentActivity | Trending inputs |

---

## Background Jobs

| Job                | Interval (configurable) | Purpose |
|--------------------|-------------------------|---------|
| `lowStockNotifier` | 30 min                  | Alerts when stock ≤ `LOW_STOCK_THRESHOLD`; emits `stock:low` to admin/inventory rooms + persistent notifications |
| `expiringCoupons`  | 60 min                  | Deactivates coupons past `expiresAt` |
| `rebuildEmbeddings`| On-demand               | Generates embeddings for books missing one; `force=true` rebuilds all |

Scheduler features: `setInterval`-based with overlap protection, `unref()` timers, `start()` / `stop()` / `runNow()` API.

---

## Security

- **JWT** — 15 min access + 7 day refresh, rotation on refresh
- **bcrypt** — 12 salt rounds
- **RBAC** — middleware gates (`protect`, `requireAdmin`, `restrictTo`)
- **Rate limiting** — 20 req / 15 min on auth, configurable global limit
- **Helmet** — security headers
- **CORS** — origin allowlist via `CLIENT_URL`
- **Validation** — `express-validator` chains on every input
- **Uploads** — MIME allowlist (JPEG/PNG/WebP/GIF/SVG) + 5 MB cap
- **Email tokens** — SHA-256 hashed, single-use, 24h / 1h expiry
- **AI guardrails** — role-gated tools, confirmation prompts for writes, PII redaction, per-session rate limit
- **Error handler** — sanitized payloads, no internal leakage

---

## Deployment

### Local development
```bash
git clone https://github.com/ShahriarSajib/book-store-mern.git
cd book-store-mern
cd server && npm install
cd ../client && npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env: MONGO_URI, JWT_*_SECRET, SMTP, LLM_API_KEY, STRIPE_*
docker compose up -d mongo
cd server && npm run seed:admin
# In two terminals:
cd server && npm run dev      # :5001
cd client && npm run dev      # :5173
```

### Docker (full stack)
```bash
docker compose up --build
```

### Production

```bash
# Server
cd server && npm ci --omit=dev && npm start

# Client
cd client && npm ci && npm run build
# Serve dist/ behind nginx or a static host

# Or build images
docker build -t ai-bookstore-server ./server
docker build -t ai-bookstore-client ./client
```

**Production checklist:**
- Managed MongoDB (Atlas) or persistent volume
- `NODE_ENV=production`
- Strong, unique `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- Real SMTP credentials
- Live LLM API key (OpenAI or compatible)
- TLS via reverse proxy (nginx / Caddy)
- Stripe live keys + production webhook endpoint
- bKash live `BKASH_BASE_URL`, app keys, and merchant credentials (verify callback URL is publicly reachable)

---



**Built with** React, Express, MongoDB, Socket.IO, Stripe, and on-device AI embeddings.



