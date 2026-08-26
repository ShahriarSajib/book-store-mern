# BookVerse — Full-Stack MERN Application

An AI-powered online bookstore built with the MERN stack (MongoDB, Express, React, Node.js) featuring semantic search, personalized recommendations, an AI chatbot, real-time notifications, Stripe payments, and a comprehensive admin panel.

**Live Demo:** [https://book-store-mern.vercel.app](https://book-store-mern.vercel.app)
**Repository:** [https://github.com/ShahriarSajib/book-store-mern](https://github.com/ShahriarSajib/book-store-mern)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
  - [Docker Setup](#docker-setup)
  - [Seeding Data](#seeding-data)
- [Authentication & Authorization](#authentication--authorization)
  - [Registration Flow](#registration-flow)
  - [Login Flow](#login-flow)
  - [Password Reset Flow](#password-reset-flow)
  - [Role-Based Access Control](#role-based-access-control)
- [Customer Flow](#customer-flow)
  - [Browsing & Search](#browsing--search)
  - [AI Recommendations](#ai-recommendations)
  - [Cart & Checkout](#cart--checkout)
  - [Payment](#payment)
  - [Order Tracking](#order-tracking)
  - [Reviews & Wishlist](#reviews--wishlist)
  - [AI Chatbot](#ai-chatbot)
  - [Notifications](#notifications)
- [Admin Flow](#admin-flow)
  - [Admin Panel Overview](#admin-panel-overview)
  - [Dashboard](#dashboard)
  - [User Management](#user-management)
  - [Book Management](#book-management)
  - [Category / Author / Publisher Management](#category--author--publisher-management)
  - [Order Management](#order-management)
  - [Inventory Management](#inventory-management)
  - [Review Moderation](#review-moderation)
  - [Coupon Management](#coupon-management)
  - [Analytics](#analytics)
  - [AI Recommendation Tuning](#ai-recommendation-tuning)
  - [Admin AI Assistant](#admin-ai-assistant)
- [AI & Recommendation Engine](#ai--recommendation-engine)
  - [Embeddings & Semantic Search](#embeddings--semantic-search)
  - [Similarity Recommendations](#similarity-recommendations)
  - [Personalized Recommendations](#personalized-recommendations)
  - [Trending Algorithm](#trending-algorithm)
  - [AI Chatbot Architecture](#ai-chatbot-architecture)
  - [RAG (Retrieval-Augmented Generation)](#rag-retrieval-augmented-generation)
- [Real-Time Features](#real-time-features)
- [API Reference](#api-reference)
  - [Auth Endpoints](#auth-endpoints)
  - [Book Endpoints](#book-endpoints)
  - [Catalog Endpoints](#catalog-endpoints)
  - [Search Endpoints](#search-endpoints)
  - [Recommendation Endpoints](#recommendation-endpoints)
  - [Cart Endpoints](#cart-endpoints)
  - [Order Endpoints](#order-endpoints)
  - [Payment Endpoints](#payment-endpoints)
  - [Review Endpoints](#review-endpoints)
  - [Coupon Endpoints](#coupon-endpoints)
  - [Chatbot Endpoints](#chatbot-endpoints)
  - [Notification Endpoints](#notification-endpoints)
  - [Admin Endpoints](#admin-endpoints)
  - [Upload Endpoints](#upload-endpoints)
- [Database Schema](#database-schema)
- [Background Jobs](#background-jobs)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Features

### Customer Features
- **Book Catalog** — Browse, filter, sort, and paginate through a full book catalog with categories, authors, and publishers
- **Semantic Search** — AI-powered vector similarity search that understands natural language queries
- **Keyword Search** — Traditional text search with autocomplete, category/author/price filters
- **AI Recommendations** — Personalized, similar-book, trending, and recently-viewed recommendations
- **Shopping Cart** — Add/remove books, update quantities, apply discount coupons
- **Checkout & Payment** — Stripe integration for card payments, plus cash-on-delivery and bKash options
- **Order Tracking** — Step-by-step order progress with estimated delivery
- **Reviews & Ratings** — Write, edit, and delete reviews with star ratings
- **Wishlist** — Save books for later, move items to cart
- **AI Chatbot** — Natural language assistant for book discovery, cart management, order tracking
- **Real-Time Notifications** — Instant updates via Socket.IO for orders, payments, and stock alerts
- **User Dashboard** — Overview of recent orders, recommendations, and account activity
- **Profile Management** — Edit personal info, manage shipping addresses, set notification preferences

### Admin Features
- **Dashboard** — Overview of total users, books, orders, revenue, and recent activity
- **User Management** — Search, filter, change roles, enable/disable, and delete users
- **Book CRUD** — Create, read, update, delete books with cover image upload
- **Category / Author / Publisher Management** — Full CRUD with active/inactive toggles
- **Order Management** — View/update order status, process refunds, search by order number
- **Inventory Management** — Stock level monitoring, inline stock editing, low-stock alerts
- **Review Moderation** — Approve/unapprove and delete reviews
- **Coupon Management** — Create discount coupons (percent/fixed) with expiry, usage limits, min-order thresholds
- **Sales Analytics** — Revenue reports, top sellers, order status breakdowns
- **Inventory Analytics** — Stock health, low/out-of-stock alerts, total inventory value
- **Recommendation Analytics** — Most recommended/clicked books, embedding status, recommendation logs
- **AI Assistant** — Chat-based analytics assistant for operational queries

### Technical Features
- **JWT Authentication** — Access + refresh token rotation with 15-minute expiry
- **Email Verification** — Account activation via email links
- **Password Reset** — Secure token-based password reset flow
- **Role-Based Access Control** — customer, book_manager, order_manager, admin roles
- **AI Embeddings** — Local sentence-transformers (MiniLM-L6-v2) for 384-dim vector embeddings
- **Real-Time Updates** — Socket.IO for order status, payment confirmations, stock alerts
- **Background Jobs** — Low-stock notifications, expiring coupon cleanup, embedding rebuilds
- **Rate Limiting** — Per-route and global rate limits to prevent abuse
- **Image Upload** — Multer-based image upload with MIME validation and size limits
- **Responsive Design** — Mobile-first Tailwind CSS with collapsible sidebar for admin

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router v6, TanStack Query v5, Tailwind CSS |
| **State Management** | React Context (Auth, Cart, Chatbot, Socket) |
| **Forms** | React Hook Form + Zod validation |
| **HTTP Client** | Axios with interceptors and auto-refresh |
| **Real-Time** | Socket.IO client |
| **Payment** | Stripe Checkout + Webhooks |
| **Icons** | React Icons |
| **Backend** | Node.js, Express, Mongoose (MongoDB ODM) |
| **Database** | MongoDB 7 |
| **Authentication** | JWT (access + refresh tokens), bcrypt password hashing |
| **Email** | Nodemailer (SMTP) |
| **AI/ML** | @xenova/transformers (sentence-transformers), OpenAI-compatible LLM API |
| **File Upload** | Multer (disk storage) |
| **Security** | Helmet, CORS, express-rate-limit, express-validator |
| **Containerization** | Docker + Docker Compose |
| **Testing** | Jest + Supertest |

---

## Project Structure

```
book-store-mern/
├── client/                          # React + Vite frontend (port 5173)
│   └── src/
│       ├── components/
│       │   ├── layout/              # Navbar, Footer, Sidebar, AdminLayout
│       │   ├── ui/                  # Button, Input, Spinner, Modal, Pagination, Skeleton, Rating, etc.
│       │   ├── books/               # BookCard, BookGrid, BookFilters, BookSort, SearchBar
│       │   ├── cart/                # CartItem, CartSummary, CouponInput
│       │   ├── chatbot/             # ChatbotWidget, ChatWindow, MessageBubble
│       │   ├── recommendations/     # SimilarBooks, TrendingBooks, PersonalizedForYou
│       │   ├── notifications/       # NotificationBell, NotificationDropdown
│       │   └── reviews/             # ReviewList, ReviewForm, RatingStars
│       ├── pages/
│       │   ├── public/              # Home, Books, BookDetails, Search, Trending, Recommended
│       │   ├── auth/                # Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│       │   ├── customer/            # Cart, Checkout, Orders, Profile, Wishlist, Addresses, Dashboard
│       │   ├── admin/               # Dashboard, Users, Books, Categories, Authors, Publishers,
│       │   │                        # Orders, Inventory, Reviews, Coupons, Analytics,
│       │   │                        # Recommendations, AIAssistant
│       │   └── chatbot/             # ChatFullPage
│       ├── context/                 # AuthContext, CartContext, ChatbotContext, SocketContext
│       ├── hooks/                   # useAuth, useCart, useChatbot, useSearch, useNotifications, etc.
│       ├── services/                # Axios instance + per-domain API modules (17 files)
│       ├── routes/                  # AppRouter, ProtectedRoute, AdminRoute
│       ├── config/                  # API base URL, constants (roles, order status)
│       └── utils/                   # format, cn, validation
│
├── server/                          # Express + Mongoose backend (port 5000)
│   └── src/
│       ├── config/                  # Environment, database, AI provider config
│       ├── models/                  # 16 Mongoose models
│       ├── controllers/             # HTTP request handlers
│       ├── routes/                  # Express routers
│       ├── services/                # Business logic layer
│       ├── repositories/            # Thin database access layer
│       ├── middleware/              # Auth, RBAC, validation, uploads, rate limiting, errors
│       ├── validators/              # Express-validator chains
│       ├── utils/                   # AppError, JWT, logger, email, pagination
│       ├── jobs/                    # Background schedulers
│       ├── ai/
│       │   ├── embeddings/          # Sentence-transformers embedding service
│       │   ├── vector/              # Vector store backends (local cosine similarity)
│       │   ├── recommendation/      # Similar, personalized, and trending algorithms
│       │   ├── rag/                 # FAQ retrieval-augmented generation
│       │   ├── llm/                 # LLM client, system prompts, tool schemas
│       │   ├── chatbot/             # Orchestrator + read/write tools (17 tools)
│       │   ├── admin/               # Admin AI Assistant + analytics tools
│       │   └── guardrails/          # Tool policy, output filter, rate limiter
│       ├── scripts/                 # Seed scripts (admin, books, catalog)
│       └── server.js                # Entry point
│
├── docker-compose.yml
├── package.json                     # Root monorepo package.json
└── .env.example
```

---

## Getting Started

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 18 | `node -v` |
| npm | >= 9 | `npm -v` |
| MongoDB | 7.x | Local, Docker, or Atlas |
| Git | any | `git --version` |

Optional: Docker + Docker Compose for containerized setup.

### Installation

```bash
# Clone the repository
git clone https://github.com/ShahriarSajib/book-store-mern.git
cd book-store-mern

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Install root dependencies (optional, for scripts)
cd .. && npm install
```

### Environment Variables

Create `.env` files from the provided templates:

```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env
```

#### Server Environment (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 5000 | Server port |
| `CLIENT_URL` | http://localhost:5173 | CORS origin |
| `MONGO_URI` | mongodb://admin:admin@localhost:27017/bookverse?authSource=admin | MongoDB connection string |
| `JWT_ACCESS_SECRET` | — | Access token secret (use a long random string) |
| `JWT_REFRESH_SECRET` | — | Refresh token secret |
| `JWT_ACCESS_EXPIRES` | 15m | Access token TTL |
| `JWT_REFRESH_EXPIRES` | 7d | Refresh token TTL |
| `BCRYPT_SALT_ROUNDS` | 12 | Password hashing rounds |
| `UPLOAD_DIR` | uploads | Static file serving directory |
| `MAX_UPLOAD_MB` | 5 | Max upload file size |
| `MAIL_HOST` | smtp.gmail.com | SMTP host |
| `MAIL_PORT` | 587 | SMTP port |
| `MAIL_USER` | — | SMTP username (email) |
| `MAIL_PASS` | — | SMTP password (app password for Gmail) |
| `MAIL_FROM` | "BookVerse" | Sender name |
| `LLM_PROVIDER` | openai | LLM provider |
| `LLM_API_KEY` | — | API key for chatbot LLM |
| `LLM_MODEL` | gpt-4o-mini | Model name |
| `EMBEDDING_PROVIDER` | sentence-transformers | Embedding provider (local or API) |
| `EMBEDDING_MODEL` | all-MiniLM-L6-v2 | Embedding model name |
| `EMBEDDING_DIM` | 384 | Vector dimensions |
| `PAYMENT_PROVIDER` | stripe | Payment provider |
| `STRIPE_SECRET_KEY` | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | — | Stripe webhook signing secret |
| `ADMIN_EMAIL` | — | Seed admin email |
| `ADMIN_PASSWORD` | — | Seed admin password |
| `LOW_STOCK_JOB_INTERVAL_MS` | 1800000 | Low stock check interval (30 min) |
| `EXPIRING_COUPONS_JOB_INTERVAL_MS` | 3600000 | Coupon cleanup interval (1 hr) |

#### Client Environment (`client/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | http://localhost:5000/api | Backend API base URL |
| `VITE_CHAT_STREAMING` | true | Enable streaming chat responses |

### Database Setup

Choose one option:

#### Option 1: Local MongoDB

Install MongoDB 7 locally. If your instance has no auth, update `MONGO_URI` to:
```
mongodb://localhost:27017/bookverse
```

#### Option 2: Docker (Database Only)

```bash
docker compose up -d mongo
```

Starts MongoDB with root user `admin`/`admin` on port 27017.

#### Option 3: MongoDB Atlas (Shared Cluster)

1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Database Access** — Add a user with read/write access
3. **Network Access** — Allow access from anywhere (`0.0.0.0/0`) for development
4. Copy the connection string and set `MONGO_URI`:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/bookverse
   ```

### Running the Application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
# Verify: curl http://localhost:5000/api/health → {"ok":true}
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Client starts at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker Setup

Run the entire stack with Docker:

```bash
# Make sure server/.env and client/.env exist
docker compose up --build
```

| Service | Port | Description |
|---------|------|-------------|
| `mongo` | 27017 | MongoDB database |
| `server` | 5000 | Express API server |
| `client` | 5173 | React frontend |

### Seeding Data

After the server is running:

```bash
# Seed an admin user (set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first)
cd server && npm run seed:admin

# Seed sample books
cd server && node scripts/seedBooks.js
```

---

## Authentication & Authorization

### Registration Flow

1. User submits name, email, and password on the Register page
2. Server hashes the password with bcrypt (12 rounds)
3. A verification token is generated (SHA-256, 24-hour expiry)
4. A verification email is sent with a link: `http://localhost:5173/verify-email?token=...`
5. User clicks the link → `GET /api/auth/verify-email/:token` → account is verified
6. User can now log in

### Login Flow

1. User enters email and password → `POST /api/auth/login`
2. Server validates credentials against bcrypt hash
3. Server issues a JWT access token (15 min) and refresh token (7 days)
4. Access token is stored in memory; refresh token is stored in localStorage
5. Axios interceptor automatically attaches `Authorization: Bearer <token>` to all requests
6. On 401 response, the interceptor silently refreshes the token and retries the request

### Password Reset Flow

1. User enters email on the Forgot Password page → `POST /api/auth/forgot-password`
2. Server generates a hashed token (1-hour expiry) and sends a reset link via email
3. User clicks the link → Redirected to Reset Password page
4. User enters new password → `POST /api/auth/reset-password` with `{ token, password }`
5. Password is updated; all previous refresh tokens are invalidated

### Role-Based Access Control

| Role | Permissions |
|------|------------|
| `customer` | Browse, search, cart, checkout, orders, reviews, wishlist, chatbot |
| `book_manager` | All customer permissions + manage books, categories, authors, publishers, inventory |
| `order_manager` | All customer permissions + manage orders |
| `admin` | Full access to all features including user management, coupons, analytics, AI assistant |

**Middleware:**
- `protect` — Verifies JWT and attaches `req.user`
- `requireVerified` — Requires verified email address
- `requireAdmin` — Requires admin role
- `restrictTo(...roles)` — Requires any of the specified roles

---

## Customer Flow

### Browsing & Search

1. **Home Page** (`/`) — Hero banner, featured books, trending, personalized recommendations
2. **Book Catalog** (`/books`) — Grid of books with sidebar filters:
   - Category filter (checkboxes)
   - Author filter (checkboxes)
   - Price range filter
   - Sort by: relevance, price low/high, newest, rating
   - Pagination with configurable page size
3. **Book Details** (`/books/:id`) — Cover image, title, authors, categories, description, price, stock status, reviews, similar books
4. **Keyword Search** (`/search`) — Full-text search with autocomplete suggestions (min 2 characters), filterable results
5. **Semantic Search** (`/ai-search`) — Natural language search using AI embeddings (e.g., "books about space exploration for beginners")
6. **Category/Author/Publisher Pages** (`/categories/:id`, `/authors/:id`, `/publishers/:id`) — Dedicated pages listing all books for that entity

### AI Recommendations

- **Similar Books** — Shown on book detail pages; finds books with similar embedding vectors
- **Personalized For You** (`/recommended`) — Multi-factor scoring based on your browsing history, liked books, favorite genres/authors, and ratings
- **Trending** (`/trending`) — Composite score from views, purchases, searches, ratings, and recent activity
- **Recently Viewed** — Books you've recently browsed (tracked in your profile)

### Cart & Checkout

1. Click "Add to Cart" on any book detail page
2. Cart icon in navbar shows item count badge
3. **Cart Page** (`/cart`) — View all items, update quantities, remove items
4. **Apply Coupon** — Enter a coupon code to get a discount (percent or fixed amount)
5. **Checkout** (`/checkout`) — Select shipping address, choose payment method:
   - **Credit/Debit Card** — Redirected to Stripe Checkout
   - **Cash on Delivery** — Order placed immediately, stock decremented
   - **bKash** — Placeholder for mobile payment
6. Stock validation ensures items are available before placing the order

### Payment

**Stripe Integration:**
1. User selects "Card" at checkout → `POST /api/payments/create-checkout-session`
2. Server creates a Stripe Checkout Session with line items and returns the session URL
3. User is redirected to Stripe's hosted checkout page
4. After payment, Stripe sends a webhook to `POST /api/payments/webhook`
5. Server verifies the webhook signature, confirms the order, decrements stock, clears the cart
6. User is redirected to `/payment/success` or `/payment/cancel`

**Cash on Delivery:**
1. Order is created with `paymentMethod: "cash_on_delivery"` and `paymentStatus: "pending"`
2. Stock is decremented immediately
3. Cart is cleared

### Order Tracking

- **Orders Page** (`/orders`) — List of all orders with status, date, total
- **Order Details** (`/orders/:id`) — Full order info: items, shipping address, status timeline, payment status
- **Order Tracking** (`/orders/:id/tracking`) — Step-by-step progress bar:
  - Pending → Confirmed → Processing → Shipped → Delivered
- **Cancel Order** — Available for pending/confirmed/processing orders (restores stock)
- **Reorder** — Adds all items from a previous order back to the cart
- **Invoice Download** — CSV file with order details

### Reviews & Wishlist

**Reviews:**
- Each user can write one review per book (unique composite index)
- Reviews include a 1-5 star rating, title, and body text
- Reviews can be edited or deleted by the author
- Admin can approve/unapprove and delete any review
- Book's average rating and review count are updated automatically

**Wishlist:**
- Save books from the detail page
- View all saved books on the Wishlist page (`/wishlist`)
- Move items from wishlist to cart
- Remove items from wishlist

### AI Chatbot

Accessible via the floating chat widget (bottom-right corner) or full-page chat (`/chat`):

- **Book Discovery** — "Recommend me a sci-fi book" → searches catalog and returns matches
- **Cart Operations** — "Add Dune to my cart" → finds the book and adds it
- **Order Management** — "Where is my order?" → fetches recent orders; "Cancel order ORD-..." → requires confirmation
- **FAQ** — "What's your return policy?" → searches FAQ knowledge base
- **Confirmation Flow** — Sensitive actions (cancel order) require explicit confirmation via a token

The chatbot maintains conversation history and auto-titles conversations from the first message.

### Notifications

- **Real-Time** — Socket.IO pushes instant toast notifications for:
  - Order created, status changed, cancelled
  - Payment confirmed, failed, expired
  - Stock updated, low stock alerts
- **Persistent** — Stored in the database with types: `order`, `order_status`, `payment`, `promotion`, `system`, `stock`
- **Management** — View all notifications, mark as read/unread, mark all as read, clear all
- **Preferences** — Toggle email/push notifications for different categories

---

## Admin Flow

### Admin Panel Overview

The admin panel is accessible at `/admin` for users with the `admin` role. It features a **sidebar navigation** with 13 sections and a **top navbar** with notifications and user menu.

| Section | URL | Description |
|---------|-----|-------------|
| Dashboard | `/admin` | Overview stats and recent activity |
| Users | `/admin/users` | User management |
| Books | `/admin/books` | Book catalog CRUD |
| Categories | `/admin/categories` | Category management |
| Authors | `/admin/authors` | Author management |
| Publishers | `/admin/publishers` | Publisher management |
| Orders | `/admin/orders` | Order management |
| Inventory | `/admin/inventory` | Stock level monitoring |
| Reviews | `/admin/reviews` | Review moderation |
| Coupons | `/admin/coupons` | Discount coupon management |
| Analytics | `/admin/analytics` | Sales, inventory, and recommendation analytics |
| Recommendations | `/admin/recommendations` | AI recommendation tuning |
| AI Assistant | `/admin/ai` | Admin AI chatbot |

### Dashboard

- Total users (with active/disabled breakdown)
- Total books, categories, authors, publishers
- Total orders (with pending count)
- Total revenue
- Recent user signups

### User Management

- **Search** users by name or email
- **Filter** by role (customer, book_manager, order_manager, admin) and status (active/disabled)
- **Change Role** — Dropdown in the Role column to promote/demote users
- **Enable/Disable** — Toggle account status
- **Delete** — Remove users (cannot delete yourself)
- **Pagination** — Navigate through pages of users

### Book Management

- **Search** books by title
- **Create** — Click "Add book", fill in the form:
  - Title (required), subtitle, authors, categories, publisher
  - Language, edition, ISBN-10, ISBN-13
  - Cover image URL or upload
  - Description, published year, pages
  - Price, stock quantity, active status
- **Edit** — Click the edit icon on any row
- **Delete** — Click the trash icon

### Category / Author / Publisher Management

Each follows the same CRUD pattern:

- **Categories** — Name (required), description, active/inactive toggle
- **Authors** — Name (required), bio, born year, country
- **Publishers** — Name (required), country, website URL

### Order Management

- **Search** by order number
- **Filter** by status (pending, confirmed, processing, shipped, delivered, cancelled)
- **Update Status** — Dropdown in the Status column to change order status
- **Refund** — Process refunds for paid orders via Stripe
- View: order number, customer name, date, item count, total, status, payment status

### Inventory Management

- View all books sorted by stock level (lowest first)
- **Inline Stock Editing** — Click on the stock number, type new value, click Save
- **Low Stock Filter** — Toggle "Show low stock only" to see books with stock ≤ 10
- Color-coded badges: green (in stock), amber (low stock), red (out of stock)

### Review Moderation

- View all customer reviews with book title, reviewer name, rating, review text, and approval status
- **Approve/Unapprove** — Toggle review visibility
- **Delete** — Remove inappropriate reviews

### Coupon Management

- **Create Coupon:**
  - Code (required, auto-uppercased)
  - Type: percent (%) or fixed ($)
  - Value (required)
  - Minimum order amount
  - Maximum discount cap
  - Usage limit
  - Expiry date
  - Active/inactive toggle
- **Edit / Delete / Enable/Disable** — Full CRUD operations

### Analytics

Three tabs:

**Sales Tab:**
- Date range filter (7, 30, 90 days or custom)
- Revenue, orders, and items sold over time
- Top 10 bestselling books
- Order status breakdown

**Inventory Tab:**
- Total books, total stock units, total inventory value
- Low stock count (stock ≤ 10)
- Out of stock count
- List of low/out-of-stock books

**Recommendations Tab:**
- Top 10 rated books
- Top 10 most purchased books
- Review statistics

### AI Recommendation Tuning

Five tabs:

| Tab | Features |
|-----|----------|
| **Overview** | Total books, embedding status, recommendation log stats, unique users reached |
| **Embeddings** | Search/filter books by embedding status, select books and queue embedding regeneration |
| **Most Recommended** | Books shown most often in recommendations (7/30/90 day periods), times shown, avg score |
| **Most Clicked** | Books with highest user engagement, unique users, total shows, avg score |
| **Logs** | Raw recommendation log entries with book, user, score, reason, and timestamp |

### Admin AI Assistant

- Chat-based interface at `/admin/ai`
- Ask questions about inventory, orders, analytics, or operational data
- Powered by an LLM with admin-specific tools (sales reports, inventory checks, user counts)

---

## AI & Recommendation Engine

### Embeddings & Semantic Search

- **Model**: `Xenova/all-MiniLM-L6-v2` via `@xenova/transformers` (runs locally, no API key needed)
- **Vector Dimension**: 384
- **Process**: Book title + description → embedding model → normalized 384-dim vector → stored in vector backend
- **Semantic Search**: User query → embedding → cosine similarity against all book embeddings → ranked results
- **Embedding Regeneration**: Admin can queue regeneration via the Recommendations admin panel

### Similarity Recommendations

Given a source book:
1. Retrieve its embedding vector
2. Compute cosine similarity against all other book embeddings
3. Return top K most similar books (excluding the source)
4. Filter by minimum similarity threshold

### Personalized Recommendations

Multi-factor scoring system:

| Signal | Weight | Description |
|--------|--------|-------------|
| Favorite genre match | +5 | Book matches user's preferred genres |
| Author match | +4 | Book by a user-favorite author |
| Liked book similarity | +6 | Similar to books the user liked |
| Viewed book similarity | +2 | Similar to books the user browsed |
| Book rating | variable | Higher-rated books score higher |
| Popularity | variable | Views, purchases, search frequency |

### Trending Algorithm

Composite trending score from `PopularityRecord`:

```
trendingScore = (purchases × 10) + (views × 1) + (searches × 3) + (rating × 5) + (recentActivity × 5)
```

Activity decays over time; recently active books are prioritized.

### AI Chatbot Architecture

```
User Message → Chatbot Orchestrator
    ├── Intent Detection (regex-based, works without LLM)
    │   ├── FAQ Search → keyword scoring against FAQ documents
    │   ├── Book Search → regex across title, authors, categories, tags
    │   ├── Cart Operations → add/remove/update cart items
    │   ├── Order Operations → list orders, track, cancel (with confirmation)
    │   └── Wishlist Operations → add/remove items
    │
    └── LLM Path (when configured)
        ├── System Prompt → context + tool definitions (18 tools)
        ├── LLM → Tool Calling → Backend Service → Database
        ├── Tool Result → LLM → Response
        └── Guardrails: role-based permissions, confirmation for writes
```

**18 LLM Tools (split read/write):**

| Read Tools | Write Tools |
|-----------|-------------|
| searchBooks, semanticSearchBooks, getBookDetails, compareBooks | addToCart, removeFromCart, updateCart |
| getSimilarBooks, getPersonalizedRecommendations, getTrendingBooks | addToWishlist, removeFromWishlist |
| getCart, getOrderHistory, getOrderStatus, searchFAQ, getWishlist | cancelOrder (requires confirmation token) |

### RAG (Retrieval-Augmented Generation)

- FAQ documents are chunked, embedded, and stored in the vector backend
- When a user asks a question, the chatbot searches the FAQ knowledge base
- Relevant FAQ content is retrieved and injected into the LLM prompt as context
- The LLM generates a response grounded in the retrieved FAQ content

---

## Real-Time Features

**Socket.IO Integration:**

- **Authentication**: JWT verified on WebSocket handshake
- **Rooms**:
  - `user:{id}` — Per-user room for personal notifications
  - `admin` — All admin/book_manager/order_manager users
  - `inventory` — Admin and book_manager users

**Events:**

| Event | Target | Trigger |
|-------|--------|---------|
| `order:created` | user + admins | New order placed |
| `order:statusChanged` | user + admins | Order status updated |
| `order:cancelled` | user + admins | Order cancelled |
| `payment:confirmed` | user + admins | Stripe payment confirmed |
| `payment:failed` | user | Stripe payment failed |
| `payment:expired` | user | Stripe session expired |
| `stock:updated` | inventory room | Stock level changed |
| `stock:low` | admin + inventory rooms | Book stock dropped below threshold |

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new account |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Public | Logout |
| POST | `/auth/forgot-password` | Public | Request password reset email |
| POST | `/auth/reset-password` | Public | Reset password with token |
| GET | `/auth/verify-email/:token` | Public | Verify email address |
| POST | `/auth/resend-verification` | Public | Resend verification email |
| GET | `/auth/me` | Authenticated | Get current user profile |
| PUT | `/auth/me` | Authenticated | Update profile |
| PUT | `/auth/me/password` | Authenticated | Change password |

### Book Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/books` | Public | List books (paginated, filterable) |
| GET | `/books/:id` | Public | Get book details |
| POST | `/books` | Admin | Create book |
| PUT | `/books/:id` | Admin | Update book |
| DELETE | `/books/:id` | Admin | Delete book |

### Catalog Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | Public | List categories |
| GET | `/categories/:id` | Public | Get category with book count |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |
| GET | `/authors` | Public | List authors |
| GET | `/authors/:id` | Public | Get author with book count |
| POST | `/authors` | Admin | Create author |
| PUT | `/authors/:id` | Admin | Update author |
| DELETE | `/authors/:id` | Admin | Delete author |
| GET | `/publishers` | Public | List publishers |
| GET | `/publishers/:id` | Public | Get publisher with book count |
| POST | `/publishers` | Admin | Create publisher |
| PUT | `/publishers/:id` | Admin | Update publisher |
| DELETE | `/publishers/:id` | Admin | Delete publisher |

### Search Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?q=` | Public | Keyword search with filters |
| GET | `/search/autocomplete?q=` | Public | Title autocomplete (min 2 chars) |
| GET | `/semantic-search?q=` | Public | AI-powered semantic search |

### Recommendation Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/recommendations/similar/:bookId` | Public | Similar books |
| GET | `/recommendations/personalized` | Authenticated | Personalized recommendations |
| GET | `/recommendations/trending` | Public | Trending books |
| GET | `/recommendations/recently-viewed` | Authenticated | Recently viewed books |

### Cart Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | Authenticated | Get cart |
| POST | `/cart` | Authenticated | Add item to cart |
| PUT | `/cart/:bookId` | Authenticated | Update item quantity |
| DELETE | `/cart/:bookId` | Authenticated | Remove item from cart |
| DELETE | `/cart` | Authenticated | Clear cart |
| POST | `/cart/coupon` | Authenticated | Apply coupon code |
| DELETE | `/cart/coupon` | Authenticated | Remove coupon |

### Order Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | Verified | Create order from cart |
| GET | `/orders` | Authenticated | List user's orders |
| GET | `/orders/:id` | Authenticated | Get order details |
| GET | `/orders/:id/tracking` | Authenticated | Get order tracking info |
| GET | `/orders/:id/invoice` | Authenticated | Download CSV invoice |
| PUT | `/orders/:id/cancel` | Verified | Cancel order |
| POST | `/orders/:id/reorder` | Verified | Reorder items to cart |

### Payment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/create-checkout-session` | Authenticated | Create Stripe checkout session |
| GET | `/payments/config` | Public | Get Stripe publishable key |
| POST | `/payments/webhook` | Raw body | Stripe webhook handler |

### Review Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/book/:bookId` | Public | List reviews for a book |
| POST | `/reviews` | Authenticated | Create review |
| PUT | `/reviews/:id` | Owner | Update review |
| DELETE | `/reviews/:id` | Owner/Admin | Delete review |

### Coupon Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/coupons/validate` | Authenticated | Validate a coupon code |

### Chatbot Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat` | Authenticated | Send message to chatbot |
| GET | `/chat/history` | Authenticated | Get conversation history |
| DELETE | `/chat/history` | Authenticated | Clear chat history |
| POST | `/chat/confirm` | Authenticated | Confirm a pending action |

### Notification Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Authenticated | List notifications |
| PUT | `/notifications/:id/read` | Authenticated | Mark as read |
| PUT | `/notifications/read-all` | Authenticated | Mark all as read |
| DELETE | `/notifications/:id` | Authenticated | Delete notification |
| DELETE | `/notifications` | Authenticated | Clear all notifications |
| GET | `/notifications/preferences` | Authenticated | Get preferences |
| PUT | `/notifications/preferences` | Authenticated | Update preferences |

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/admin/users` | Admin | List users (search, filter, paginate) |
| GET | `/admin/users/:id` | Admin | Get user details |
| PUT | `/admin/users/:id` | Admin | Update user (role, status) |
| DELETE | `/admin/users/:id` | Admin | Delete user |
| GET | `/admin/inventory` | Admin | List all books with stock |
| PUT | `/admin/inventory/:id` | Admin | Update stock level |
| GET | `/admin/reviews` | Admin | List all reviews |
| PUT | `/admin/reviews/:id` | Admin | Moderate review |
| DELETE | `/admin/reviews/:id` | Admin | Delete review |
| GET | `/admin/coupons` | Admin | List all coupons |
| POST | `/admin/coupons` | Admin | Create coupon |
| PUT | `/admin/coupons/:id` | Admin | Update coupon |
| DELETE | `/admin/coupons/:id` | Admin | Delete coupon |
| GET | `/admin/orders` | Admin | List all orders |
| PUT | `/admin/orders/:id` | Admin | Update order status |
| POST | `/admin/orders/:id/refund` | Admin | Process refund |
| GET | `/admin/analytics/sales` | Admin | Sales report |
| GET | `/admin/analytics/inventory` | Admin | Inventory report |
| GET | `/admin/analytics/recommendations` | Admin | Recommendation analytics |
| GET | `/admin/recommendations/summary` | Admin | Recommendation summary |
| GET | `/admin/recommendations/embeddings` | Admin | Embedding status |
| GET | `/admin/recommendations/logs` | Admin | Recommendation logs |
| GET | `/admin/recommendations/most-recommended` | Admin | Most recommended books |
| GET | `/admin/recommendations/most-clicked` | Admin | Most clicked books |
| POST | `/admin/recommendations/embeddings/regenerate` | Admin | Queue embedding regeneration |
| POST | `/admin/ai/chat` | Admin | Chat with admin AI assistant |

### Upload Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload/image` | Admin | Upload image (JPEG/PNG/WebP/GIF/SVG, max 5MB) |

---

## Database Schema

| Collection | Key Fields | Purpose |
|------------|-----------|---------|
| **users** | name, email, password (hashed), role, isActive, isEmailVerified, addresses[], browseHistory[], searchHistory[], favoriteGenres[], notificationPreferences | User accounts with RBAC |
| **books** | title, slug, subtitle, authors[], categories[], publisher, language, isbn10/isbn13, coverImage, description, publishedYear, pages, price, stock, tags[], averageRating, reviewCount, viewCount, purchaseCount, embeddingId | Book catalog with embeddings |
| **categories** | name, slug, description, isActive | Book categories |
| **authors** | name, bio, image, bornYear, country, isActive | Author profiles |
| **publishers** | name, slug, country, website, isActive | Publisher profiles |
| **carts** | user (ref), items[{book, quantity, price}], coupon{code, discount} | Per-user shopping cart |
| **orders** | orderNumber, user (ref), items[], coupon, subtotal, shipping, tax, total, status, paymentStatus, paymentMethod, stripeSessionId, shippingAddress, trackingNumber | Completed orders |
| **reviews** | book (ref), user (ref), rating, title, body, helpfulCount, isApproved | Per-user-per-book reviews |
| **coupons** | code, type (percent/fixed), value, minOrder, maxDiscount, expiresAt, usageLimit, usedCount, isActive | Discount codes |
| **conversations** | user (ref), title, messages[{role, content, books[], tool{}}] | Chatbot history |
| **faqdocuments** | question, answer, category, keywords[], embeddingId | FAQ knowledge base |
| **notifications** | user (ref), type, title, message, read, link, data{} | Persistent notifications |
| **wishlists** | user (ref), items[{book, addedAt}] | Per-user wishlist |
| **userpreferences** | userId, favoriteGenres[], favoriteAuthors[], viewedBooks[], likedBooks[] | Personalization data |
| **recommendationlogs** | userId, bookId (ref), score, reason | Recommendation tracking |
| **popularityrecords** | bookId (ref, unique), views, purchases, searches, recentActivity | Trending score data |

---

## Background Jobs

| Job | Interval | Description |
|-----|----------|-------------|
| `lowStockNotifier` | Every 30 min (configurable) | Scans books with stock ≤ threshold (default 5), emits Socket.IO events to admin/inventory rooms, creates persistent notifications |
| `expiringCoupons` | Every 1 hour (configurable) | Deactivates coupons past their `expiresAt` date |
| `rebuildEmbeddings` | On-demand | Generates embeddings for books without one; supports `force` flag for full rebuild |

**Scheduler**: Lightweight `setInterval`-based with overlap protection, `unref()` timers, and `start()`/`stop()`/`runNow()` API.

---

## Security

- **JWT**: Access token (15 min) + refresh token (7 days) with rotation on refresh
- **Password Hashing**: bcrypt with 12 salt rounds
- **RBAC**: Role-based middleware gates (`protect`, `requireAdmin`, `restrictTo`)
- **Rate Limiting**: 20 requests/15min for auth endpoints; configurable global limits
- **Helmet**: Security HTTP headers
- **CORS**: Configurable origin allowlist
- **Validation**: express-validator chains on all input
- **File Upload**: Multer with MIME type validation (JPEG/PNG/WebP/GIF/SVG) and 5MB size limit
- **Error Handling**: Centralized error handler with sanitized payloads (no internal details leaked)
- **Email Tokens**: SHA-256 hashed, one-time use, short-lived (24h verification, 1h password reset)
- **AI Guardrails**: Role-based tool permissions, confirmation prompts for sensitive write operations, PII redaction in LLM output, per-session rate limiting

---

## Deployment

### Local Development

```bash
# 1. Clone and install
git clone https://github.com/ShahriarSajib/book-store-mern.git
cd book-store-mern
cd server && npm install
cd ../client && npm install

# 2. Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env with your MongoDB URI, JWT secrets, etc.

# 3. Start MongoDB (choose one)
docker compose up -d mongo          # Docker
# or use local MongoDB / Atlas

# 4. Seed admin
cd server && npm run seed:admin

# 5. Start servers (in separate terminals)
cd server && npm run dev            # http://localhost:5000
cd client && npm run dev            # http://localhost:5173
```

### Docker (Full Stack)

```bash
# Ensure .env files exist
docker compose up --build
```

### Production

```bash
# Build server
cd server && npm ci --omit=dev && npm start

# Build client
cd client && npm ci && npm run build
# Serve dist/ with nginx or a static file server

# Or build Docker images
docker build -t ai-bookstore-server ./server
docker build -t ai-bookstore-client ./client
```

**Production checklist:**
- Use a managed MongoDB (Atlas) or persistent Docker volume
- Set `NODE_ENV=production`
- Use strong, unique `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Configure real SMTP credentials
- Set up a real LLM API key (OpenAI or compatible)
- Place behind a reverse proxy (nginx/Caddy) for TLS
- Configure Stripe live keys and webhook endpoint

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check `MONGO_URI` matches your DB credentials; confirm Mongo is running |
| Port already in use | Change `PORT` in `server/.env` or kill the process using that port |
| Emails not sending | Gmail requires an App Password (not account password); use port 587 |
| CORS / 404 from frontend | Verify `CLIENT_URL` in `server/.env` is `http://localhost:5173` |
| Endpoint returns 404 | The module may still be a stub; check the controller/route file |
| Stripe webhook not firing | Use `stripe listen --forward-to localhost:5000/api/payments/webhook` for local testing |
| Embeddings not generating | Ensure `@xenova/transformers` is installed; check server logs for model download |
| Socket.IO connection issues | Verify `CLIENT_URL` matches the frontend origin; check JWT is valid |
| `npm ci` fails | Delete `package-lock.json` and run `npm install` |
| Atlas connection refused | Verify the Atlas DB user password and IP access (allow `0.0.0.0/0` for dev) |

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with** React, Express, MongoDB, Socket.IO, Stripe, and AI-powered recommendations.
