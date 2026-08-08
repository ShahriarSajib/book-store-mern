# Database

MongoDB (Mongoose). Database name configured via `MONGO_URI`.

## Collections

| Collection | Purpose | Notes |
|------------|---------|-------|
| users | Account, role, hashed password, refresh tokens | role: `customer` \| `admin` |
| books | Catalog | embedding reference (vector backend), `viewCount`, `purchaseCount`, `averageRating`, `reviewCount` |
| categories | Book categories | |
| authors | Authors | |
| publishers | Publishers | |
| reviews | Ratings + text | unique per (userId, bookId) |
| carts | Active cart per user | |
| wishlists | Wishlist per user | |
| orders | Orders, line items, status history | |
| coupons | Discount codes | |
| conversations | Chat history (user ↔ assistant) | LLM never writes here directly |
| faqdocuments | FAQ / policy corpus | chunked, embedded, vector-indexed |

## Indexes (planned)

- `users`: `{ email: 1 }` unique
- `books`: `{ title: 'text', description: 'text', tags: 'text' }`, `{ category: 1 }`, `{ author: 1 }`, `{ publisher: 1 }`, `{ averageRating: -1 }`
- `reviews`: `{ userId: 1, bookId: 1 }` unique
- `orders`: `{ userId: 1, createdAt: -1 }`, `{ status: 1 }`
- `conversations`: `{ userId: 1, updatedAt: -1 }`

## Embedding storage

Embeddings are stored in the vector backend (`EMBEDDING_BACKEND`) — not in Mongo. Each `Book` and `FaqDocument` row keeps only an `embeddingId` reference plus a cached vector for the local backend.

## Persistence guarantees

- All write tools from the chatbot route through services that own the transaction.
- `OrderService.createOrder` decrements stock atomically.
- `ReviewService` updates `Book.averageRating` / `reviewCount` via hook.