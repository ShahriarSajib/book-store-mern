# Admin Guide — AI Bookstore

## 1. Creating an Admin Account

There are two ways to become an admin:

### Option A: Seed Script (Recommended)

1. Open `server/.env` and set your admin credentials:

```
ADMIN_EMAIL=admin@bookstore.com
ADMIN_PASSWORD=YourStrongPassword123
ADMIN_NAME=Store Admin
```

2. Run the seed script from the `server/` directory:

```bash
cd server
npm run seed:admin
```

3. If the email already exists, the script upgrades it to admin. If not, it creates a new admin user.

### Option B: Promote via MongoDB Compass or Atlas

1. Open your MongoDB database (`ai_bookstore`)
2. Find the `users` collection
3. Find the user you want to promote
4. Set these fields:
   - `role`: `"admin"`
   - `isActive`: `true`
   - `isEmailVerified`: `true`

### Option C: Promote via API (if you have an existing admin)

```bash
curl -X PUT http://localhost:5001/api/admin/users/<USER_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## 2. Logging In

1. Start the servers:

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

2. Open `http://localhost:5173`
3. Click **Login** and enter your admin email/password
4. Once logged in, click **Admin** in the navbar to access the admin panel

---

## 3. Admin Panel Overview

The admin panel lives at `/admin` and has a sidebar with 13 sections:

| Section | URL | Description |
|---------|-----|-------------|
| Dashboard | `/admin` | Overview stats and recent signups |
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
| Recommendations | `/admin/recommendations` | AI recommendation management |
| AI Assistant | `/admin/ai` | Admin AI chatbot |

---

## 4. What You Can Do in Each Section

### Dashboard (`/admin`)
- View total users, active users, books, categories, authors, publishers, orders, pending orders, and revenue
- See recent user signups
- Quick links to user management

### User Management (`/admin/users`)
- **Search** users by name or email
- **Filter** by role (customer, book_manager, order_manager, admin) and status (active/disabled)
- **Change role** — use the dropdown in the Role column
- **Enable/Disable** accounts — click the Enable/Disable button
- **Delete** users — click the trash icon (cannot delete yourself)
- **Pagination** — navigate through pages of users

### Book Management (`/admin/books`)
- **Search** books by title
- **Create** a new book — click "Add book", fill the form (title required)
- **Edit** a book — click the edit icon on any row
- **Delete** a book — click the trash icon
- **Toggle active** status — edit the book and check/uncheck "Active"
- Fields: title, subtitle, authors, categories, publisher, language, ISBNs, cover image URL, description, year, pages, price, stock, active status

### Category Management (`/admin/categories`)
- **Create** — click "Add category" (name required)
- **Edit** — click the edit icon
- **Delete** — click the trash icon
- **Toggle active/inactive** — click the Active/Inactive button

### Author Management (`/admin/authors`)
- **Create** — click "Add author" (name required)
- **Edit** — click the edit icon (fields: name, bio, born year, country)
- **Delete** — click the trash icon

### Publisher Management (`/admin/publishers`)
- **Create** — click "Add publisher" (name required)
- **Edit** — click the edit icon (fields: name, country, website)
- **Delete** — click the trash icon

### Order Management (`/admin/orders`)
- **Search** by order number
- **Filter** by status (pending, confirmed, processing, shipped, delivered, cancelled)
- **Update order status** — use the dropdown in the Status column
- View order number, customer name, date, item count, total, status, and payment status

### Inventory (`/admin/inventory`)
- View all books sorted by stock level
- **Inline stock editing** — click on the stock number, type new value, click Save
- **Low stock filter** — toggle "Show low stock only" to see books with stock ≤ 10
- Stock badges: green (in stock), amber (low), red (out of stock)

### Review Moderation (`/admin/reviews`)
- View all customer reviews with book, reviewer, rating, review text, and approval status
- **Approve/Unapprove** — click the button in the Approved column
- **Delete** any review — click the trash icon

### Coupon Management (`/admin/coupons`)
- **Create** — click "Create coupon"
  - Code (required, auto-uppercased)
  - Type: percent (%) or fixed ($)
  - Value (required)
  - Minimum order amount
  - Max discount cap
  - Usage limit
  - Expiry date
  - Active/inactive toggle
- **Edit** — click the edit icon
- **Delete** — click the trash icon
- **Enable/Disable** — click the Enable/Disable button

### Analytics (`/admin/analytics`)
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

### Recommendations (`/admin/recommendations`)
Five tabs:

**Overview:**
- Total books, embedding status, recommendation log stats, unique users reached

**Embeddings:**
- Search and filter books by embedding status
- Select books and queue embedding regeneration

**Most Recommended:**
- Books shown most often in recommendations (7/30/90 day periods)
- Times shown, average score, recommendation reasons

**Most Clicked:**
- Books with highest user engagement from recommendations
- Unique users, total shows, average score

**Logs:**
- Raw recommendation log entries
- Filter by book ID, date range
- Shows book, user, score, reason, and timestamp

### AI Assistant (`/admin/ai`)
- Chat with the admin AI assistant
- Get help with bookstore operations
- Ask questions about inventory, orders, or analytics

---

## 5. Admin API Endpoints

All admin endpoints require `Authorization: Bearer <JWT>` header and `role: "admin"`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Dashboard stats |
| `GET` | `/api/admin/users` | List users (params: search, role, status, page, limit) |
| `GET` | `/api/admin/users/:id` | Get user details |
| `PUT` | `/api/admin/users/:id` | Update user (role, isActive, isEmailVerified, name, phone) |
| `DELETE` | `/api/admin/users/:id` | Delete user |
| `GET` | `/api/admin/inventory` | List all books with stock |
| `PUT` | `/api/admin/inventory/:id` | Update book stock |
| `GET` | `/api/admin/reviews` | List reviews (params: isApproved, page, limit) |
| `PUT` | `/api/admin/reviews/:id` | Update review (isApproved, rating, body) |
| `DELETE` | `/api/admin/reviews/:id` | Delete review |
| `GET` | `/api/admin/coupons` | List all coupons |
| `POST` | `/api/admin/coupons` | Create coupon |
| `PUT` | `/api/admin/coupons/:id` | Update coupon |
| `DELETE` | `/api/admin/coupons/:id` | Delete coupon |
| `GET` | `/api/admin/orders` | List orders (params: status, search, page, limit) |
| `PUT` | `/api/admin/orders/:id` | Update order (status, paymentStatus, trackingNumber) |
| `POST` | `/api/admin/orders/:id/refund` | Refund a paid order |
| `GET` | `/api/admin/analytics/sales` | Sales report |
| `GET` | `/api/admin/analytics/inventory` | Inventory analytics |
| `GET` | `/api/admin/analytics/recommendations` | Recommendation analytics |
| `GET` | `/api/admin/recommendations/summary` | Recommendation summary |
| `GET` | `/api/admin/recommendations/embeddings` | Embedding status |
| `GET` | `/api/admin/recommendations/logs` | Recommendation logs |
| `GET` | `/api/admin/recommendations/most-recommended` | Most recommended books |
| `GET` | `/api/admin/recommendations/most-clicked` | Most clicked books |
| `POST` | `/api/admin/recommendations/embeddings/regenerate` | Queue embedding regeneration |
| `POST` | `/api/admin/ai/chat` | AI assistant chat |

Additional admin-gated endpoints via other route files:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/books` | Create book |
| `PUT` | `/api/books/:id` | Update book |
| `DELETE` | `/api/books/:id` | Delete book |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE` | `/api/categories/:id` | Delete category |
| `POST` | `/api/authors` | Create author |
| `PUT` | `/api/authors/:id` | Update author |
| `DELETE` | `/api/authors/:id` | Delete author |
| `POST` | `/api/publishers` | Create publisher |
| `PUT` | `/api/publishers/:id` | Update publisher |
| `DELETE` | `/api/publishers/:id` | Delete publisher |
| `POST` | `/api/upload/image` | Upload image file |

---

## 6. Quick Start Checklist

1. [ ] Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`
2. [ ] Run `npm run seed:admin` from `server/`
3. [ ] Start server (`npm run dev`) and client (`npm run dev`)
4. [ ] Login at `http://localhost:5173/login`
5. [ ] Click "Admin" in the navbar
6. [ ] Explore all 13 admin sections via the sidebar
