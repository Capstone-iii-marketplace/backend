# Sell Me A Pen — API

Express + Socket.IO backend for a real-time CUNY student marketplace: auth, listings, chat, video calling, reviews, and Stripe checkout.

**Live API:** [backend-55py.onrender.com](https://backend-55py.onrender.com)
**Frontend repo:** [Capstone-iii-marketplace/frontend](https://github.com/Capstone-iii-marketplace/frontend)

A CUNY Capstone III project.

## Tech stack

- Node + Express 5
- PostgreSQL + Sequelize ORM
- Socket.IO, authenticated via JWT on the handshake
- Stripe Checkout + webhooks
- Resend for transactional email
- bcrypt for password hashing, JWT for sessions (httpOnly cookie)

## Getting started

```bash
npm install
cp .env.example .env   # fill in values, see below
node seed.js            # creates tables and demo data — see warning below
npm run dev
```

Runs on `http://localhost:3000`.

> **`seed.js` runs `sequelize.sync({ force: true })`, which drops and recreates every table.** Only run it against a local or throwaway database. Never point it at a shared or production `DATABASE_URL`.

Demo accounts after seeding (password `password123` for all): `alice@qc.cuny.edu`, `bob@qc.cuny.edu`, `carlos@qc.cuny.edu`, `dana@brooklyn.cuny.edu`.

## Environment variables

| Key | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. Neon URLs need `?sslmode=require`. |
| `PORT` | no | Defaults to `3000`. |
| `JWT_SECRET` | yes | Any long random string. |
| `JWT_EXPIRES_IN` | no | e.g. `7d`. |
| `CLIENT_URL` | yes | Frontend origin — used for CORS and as the base of Stripe's `success_url`/`cancel_url`. No trailing slash. |
| `NODE_ENV` | yes in prod | Must be exactly `production` for the auth cookie to work cross-site (`sameSite: none; secure: true`). |
| `STRIPE_SECRET_KEY` | for payments | Server boots without it; checkout returns 503 until set. |
| `STRIPE_WEBHOOK_SECRET` | for payments | From the Stripe dashboard webhook endpoint — required for orders to be marked paid. |
| `STRIPE_PUBLISHABLE_KEY` | no | Not currently read server-side; kept for reference. |
| `RESEND_API` | for email | Sandbox accounts can only deliver to the account owner's own address until a domain is verified. |
| `EMAIL_FROM` | for email | Sender address for transactional email. |

## API routes

| Route | Handles |
| --- | --- |
| `/api/auth` | signup, login, logout, current user |
| `/api/listings` | listing CRUD, search |
| `/api/conversations` | chat threads and message history |
| `/api/orders` | Stripe Checkout session creation, order history |
| `/api/webhooks` | Stripe webhook (`checkout.session.completed`) |
| `/api/reviews` | seller reviews |
| `/api/users` | public profile data |
| `/health` | DB connectivity check |

Real-time messaging and call signaling run over Socket.IO on the same server, authenticated from the JWT cookie at handshake. Rooms are keyed per conversation.

## Deployment

Deployed on Render, building from `main` with `npm install` / `npm start`. Database is PostgreSQL on Neon.

## Team

Capstone III — Phyo, Zin, Shan, Seoyeon
