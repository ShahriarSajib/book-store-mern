# Book Store MERN — Setup & Run Guide

AI-powered MERN book store: React (Vite) frontend + Express/MongoDB backend, with email-based authentication (registration verification + forgot/reset password).

---

## 1. Prerequisites

| Tool    | Version  | Notes                                   |
| ------- | -------- | --------------------------------------- |
| Node.js | >= 18    | Check: `node -v`                        |
| npm     | >= 9     | Check: `npm -v`                         |
| MongoDB | 7.x      | Local install **or** Docker **or** Atlas (option 3) |
| Git     | any      | To clone (if not already cloned)        |

Optional: `docker` + `docker compose` to run MongoDB (or the whole stack).

---

## 2. Project structure

```
book-store-mern/
├── client/          # React + Vite frontend (port 5173)
├── server/          # Express + Mongoose backend (port 5000)
├── docker-compose.yml
├── .env.example     # shared env template
└── docs/
```

---

## 3. Environment configuration

Create three `.env` files. All templates already exist as `.env.example`.

### 3a. Root — `.env` (optional, shared values)

```bash
cp .env.example .env
```

### 3b. Backend — `server/.env` (required)

```bash
cp server/.env.example server/.env
```

Edit the values you need:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://admin:admin@localhost:27017/ai_bookstore?authSource=admin

# Use long random strings in real use
JWT_ACCESS_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_SALT_ROUNDS=12

UPLOAD_DIR=uploads
MAX_UPLOAD_MB=5

# ----- Email (required for email auth) — see section 7 -----
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_account@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM="AI Bookstore <your_account@gmail.com>"
```

> If your Mongo has no auth, use `mongodb://localhost:27017/ai_bookstore`.

### 3c. Frontend — `client/.env` (required)

```bash
cp client/.env.example client/.env
```

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CHAT_STREAMING=true
```

> The Vite dev server also proxies `/api` → `http://localhost:5000`, so the frontend can call the backend either way.

---

## 4. Database setup

Choose ONE option.

### Option 1 — Local MongoDB (simplest, single dev)

Install MongoDB 7 locally, then start it. The default connection string assumes `admin`/`admin` root credentials with `authSource=admin`.

If you don't want to set root credentials, create `admin`/`admin` or change `MONGO_URI` to a URI matching your setup.

### Option 2 — MongoDB via Docker (only the DB)

```bash
docker compose up -d mongo
```

Creates the `mongo` container with root user `admin` / password `admin` (both overridable via `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD`).

### Option 3 — Shared MongoDB Atlas cluster (recommended for 2+ teammates)

Both devs run the stack **locally** but connect to **one shared cloud database**, so you all see the same data.

**3.1 Create the shared cluster (once, by anyone)**
1. Sign up at https://www.mongodb.com/atlas → create a **free M0** cluster.
2. **Database Access** → Add New User:
   - Username: e.g. `bookstore` (you can add 2 users — one per person — or share one).
   - Password: strong one (this is what both devs put in `.env`).
3. **Network Access** → Add IP:
   - For teamwork with changing IPs: **Allow access from anywhere** (`0.0.0.0/0`) — fine for a dev DB, but keep a strong password. Otherwise add each teammate's IP individually.

**3.2 Get the connection string**
- **Database** → your cluster → **Connect** → Drivers → Node.js.
- Copy the URI and replace `<password>` + set the database name:

```env
MONGO_URI=mongodb+srv://bookstore:<password>@cluster0.xxxxx.mongodb.net/ai_bookstore
```

**3.3 Configure every dev's `server/.env`**

Each teammate does:
```bash
cp server/.env.example server/.env
```
and sets the same value:
```env
MONGO_URI=mongodb+srv://bookstore:<password>@cluster0.xxxxx.mongodb.net/ai_bookstore
```

**3.4 Share it safely**
- `.env` files are gitignored (`.gitignore:14-18`), so the password is never committed.
- Put a **placeholder** Atlas URI in `server/.env.example` (and root `.env.example`) so teammates know exactly what to fill in — those files can be committed freely.

> For production use: keep secrets only in `.env`, never commit them; if you remove "allow access from anywhere", add the deploy server's IP instead.

### Option 4 — Full stack via Docker

```bash
docker compose up --build
```

Runs mongo + server + client together on one machine. Requires `server/.env` and `client/.env` to exist first. (Local-only — not suitable for sharing with remote teammates by itself.)

---

## 5. Run the backend

```bash
cd server
npm install          # or npm ci if you have package-lock.json
npm run dev          # nodemon, restarts on change
# production: npm start
```

Verify it started:

```bash
curl http://localhost:5000/api/health
# -> {"ok":true}
```

Optional scripts (once the backend is running):

```bash
node scripts/seedBooks.js
node scripts/seedAdmin.js   # creates first admin user
npm test             # Jest test suite
```

> Note: some server modules are still scaffolded (`// TODO` stubs), so endpoints may 404 until implemented. The setup and wiring below describe the intended flow.

---

## 6. Run the frontend

```bash
cd client
npm install          # or npm ci
npm run dev          # Vite dev server on http://localhost:5173
# production: npm run build && npm run preview
```

Open http://localhost:5173.

---

## 7. Email-based authentication

The app uses standard email-auth flows. All endpoints live under `/api/auth`.

### 7.1 Configure the mail transport (nodemailer)

In `server/.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=you@gmail.com
MAIL_PASS=your_16_char_app_password
MAIL_FROM="AI Bookstore <you@gmail.com>"
```

**Gmail (dev):**
1. Enable 2-Step Verification on the Google account.
2. Create an App Password (Google Account → Security → App passwords).
3. Paste it in `MAIL_PASS`. Never use your normal login password.

**Mailtrap (dev, no real delivery):** use `smtp.mailtrap.io`, port `2525`, your inbox username/password — emails stay in the dashboard.

**Mailgun / SendGrid / other SMTP:** use their SMTP host/port/user/pass.

### 7.2 Auth endpoints (as designed)

| Method | Route                          | Purpose                                       |
| ------ | ------------------------------ | --------------------------------------------- |
| POST   | `/api/auth/register`           | Create account → sends verification email     |
| GET    | `/api/auth/verify-email/:token` | Verify email from the link in the email      |
| POST   | `/api/auth/login`              | Email + password → returns access/refresh JWT |
| POST   | `/api/auth/logout`             | Invalidate the refresh token                  |
| POST   | `/api/auth/refresh`            | Rotate refresh → new access token             |
| GET    | `/api/auth/me`                 | Current user profile                          |
| PUT    | `/api/auth/me`                 | Update profile                                |
| PUT    | `/api/auth/me/password`        | Change password (while logged in)             |
| POST   | `/api/auth/forgot-password`    | Sends password-reset email with a token       |
| POST   | `/api/auth/reset-password`     | Accepts token + new password                  |

### 7.3 How the flows work end-to-end

**Registration + email verification**
1. User submits the Register form → `POST /api/auth/register`.
2. Backend hashes the password, creates the user, generates a signed verification token, emails a link like:
   `http://localhost:5173/verify-email?token=...`
3. User clicks it → frontend calls `GET /api/auth/verify-email/:token` → account becomes verified.

**Forgot password**
1. User enters email on the forgot-password page → `POST /api/auth/forgot-password`.
2. Backend emails a reset link:
   `http://localhost:5173/reset-password?token=...`
3. User submits a new password → `POST /api/auth/reset-password` with `{ token, password }`.

**Frontend pages** (already present in `client/src/pages/auth/`): `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `VerifyEmail.jsx`.
API client: `client/src/services/authApi.js`.

> **Security notes:** use long random JWT secrets; `JWT_ACCESS_EXPIRES=15m` with refresh rotation; send email tokens as one-time short-lived links; never log tokens or passwords.

---

## 8. Environment summary

| Piece    | Command                     | URL                          |
| -------- | --------------------------- | ---------------------------- |
| MongoDB  | `docker compose up -d mongo` (or Atlas) | `localhost:27017` or Atlas URI |
| Backend  | `cd server && npm run dev`  | http://localhost:5000        |
| Frontend | `cd client && npm run dev`  | http://localhost:5173        |
| Health   | `curl localhost:5000/api/health` | `{"ok":true}`            |

---

## 9. Troubleshooting

- **MongoDB connection errors** → check `MONGO_URI` matches your DB credentials; confirm Mongo is running (local/Docker) or that the Atlas cluster's network access allows your IP.
- **Port already in use** → change `PORT` in `server/.env` (and `VITE_API_BASE_URL` in `client/.env`), or kill the process on that port.
- **Emails not sending** → Gmail requires an App Password (not the account password); with Mailtrap confirm you used port `2525`.
- **CORS / 404 errors from the frontend** → verify `CLIENT_URL` in `server/.env` is `http://localhost:5173` and the server is running.
- **`npm ci` fails** → delete `package-lock.json` and use `npm install`.
- **Endpoint returns 404** → the module may still be a `// TODO` stub; check the corresponding controller/route file.
- **Teammate can't connect to Atlas** → verify the Atlas DB user password is correct and their IP is allowed (or `0.0.0.0/0` is enabled).
