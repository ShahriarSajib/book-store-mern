# API

Base URL: `/api`

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | public | Register |
| POST | `/auth/login` | public | Login |
| POST | `/auth/refresh` | public | Refresh access token |
| POST | `/auth/forgot-password` | public | Request reset email |
| POST | `/auth/reset-password/:token` | public | Reset password |
| GET  | `/auth/verify-email/:token` | public | Verify email |
| POST | `/auth/logout` | user | Logout |

## Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/users/me` | user | Current profile |
| PATCH| `/users/me` | user | Update profile |
| PATCH| `/users/me/password` | user | Change password |
| GET  | `/users` | admin | List users |
| PATCH| `/users/:id/role` | admin | Update role |
| DELETE| `/users/:id` | admin | Delete user |

## Catalog

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/books` | public | List books (filters, sort, paginate) |
| GET  | `/books/:id` | public | Book details |
| GET  | `/categories` | public | List categories |
| GET  | `/authors` | public | List authors |
| GET  | `/publishers` | public | List publishers |
| POST/PATCH/DELETE | `/books` | admin | Book CRUD |
| ... | `/categories`, `/authors`, `/publishers` | admin | CRUD |

## Reviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/reviews/book/:bookId` | public | List reviews |
| POST | `/reviews` | user | Create review |
| PATCH| `/reviews/:id` | user (owner) | Update |
| DELETE| `/reviews/:id` | user (owner) / admin | Delete |

## Cart & Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST/PATCH/DELETE | `/cart` | user | Cart CRUD |
| POST | `/orders` | user | Create order |
| GET  | `/orders/me` | user | My orders |
| GET  | `/orders/:id` | user (owner) / admin | Order details |
| PATCH| `/orders/:id/status` | admin | Update status |
| PATCH| `/orders/:id/cancel` | user (owner) | Cancel |
| GET  | `/orders` | admin | All orders |

## Coupons

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/coupons/validate` | user | Validate code |
| CRUD | `/coupons` | admin | Manage |

## Search & Recommendations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/search?q=` | public | Keyword search |
| GET  | `/recommendations/similar/:bookId` | public | Similar books |
| GET  | `/recommendations/personalized` | user | Personalized |
| GET  | `/recommendations/trending` | public | Trending |

## AI Chatbot

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/chatbot/message` | user | Send user message, receive assistant reply |
| GET  | `/chatbot/conversations` | user | List my conversations |
| GET  | `/chatbot/conversations/:id` | user | Conversation history |

## FAQ / RAG

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/faq/search?q=` | public | Keyword/vector FAQ search |

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/ai/chat` | admin | Admin AI Assistant |
| GET  | `/admin/stats/dashboard` | admin | Dashboard KPIs |
| GET  | `/admin/stats/sales` | admin | Sales summary |
| GET  | `/admin/stats/inventory` | admin | Inventory health |

## Uploads

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload/image` | admin | Upload image (multer) |