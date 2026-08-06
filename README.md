# Tribhuvan Portal

College management system for **Tribhuvan College, Neemrana, Rajasthan 301705**.

A full-stack monorepo with a React web app, React Native mobile app, and Express.js backend — all sharing the same business logic and type definitions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend (Web) | React 18 + Vite + React Router v6 + Tailwind CSS |
| Mobile App | React Native + Expo SDK 51 + Expo Router |
| Shared Logic | TypeScript types, Zod validators, constants |
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Authentication | Firebase Auth (Google OAuth — `@tribhuvancollege.ac.in` only) |
| File Storage | Firebase Storage |
| Real-time | Socket.io (live attendance updates) |
| Email | Nodemailer (approval notifications) |
| Monorepo | npm workspaces |

---

## Project Structure

```
tribhuvan-portal/
├── apps/
│   ├── web/          ← React + Vite web application
│   └── mobile/       ← React Native + Expo mobile app
├── packages/
│   ├── shared/       ← Shared types, constants, validators
│   └── ui-tokens/    ← Design tokens
└── server/           ← Express.js + Prisma backend
```

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** >= 14
- **Firebase project** with Authentication and Storage enabled

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd tribhuvan-portal
npm install
```

### 2. Set Up PostgreSQL

Create a database:

```sql
CREATE DATABASE tribhuvan_portal;
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Authentication** → **Google** sign-in provider
4. In Google provider settings, restrict to domain: `tribhuvancollege.ac.in`
5. Enable **Firebase Storage**
6. Go to **Project Settings** → **Service Accounts** → **Generate new private key**
7. Copy the credentials to your `.env` file

### 4. Configure Environment

```bash
cp .env.example .env
```

Fill in all values in `.env`:
- Database connection string
- Firebase Admin credentials (from service account JSON)
- Firebase Client config (from Firebase Console → Project Settings → Your apps)
- SMTP credentials for email notifications

### 5. Run Database Migrations

```bash
npm run db:migrate
```

### 6. Seed Sample Data

```bash
npm run db:seed
```

### 7. Start Development

```bash
# Run server + web concurrently
npm run dev

# Or run individually
npm run dev:server   # Express API on http://localhost:5000
npm run dev:web      # Vite dev server on http://localhost:5173
npm run dev:mobile   # Expo dev server
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start server + web concurrently |
| `npm run dev:web` | Start web app only |
| `npm run dev:mobile` | Start Expo mobile app |
| `npm run dev:server` | Start Express server |
| `npm run build:web` | Build web app for production |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run lint` | Run ESLint across all workspaces |
| `npm run format` | Format code with Prettier |

---

## Auth Flow

1. User clicks **"Sign in with Google"**
2. Firebase Auth opens Google OAuth (restricted to `@tribhuvancollege.ac.in`)
3. On first login → `POST /api/auth/register` creates user with `status = PENDING`
4. Admin receives email notification
5. Admin approves → user `status = APPROVED` → user receives confirmation email
6. Approved users can access their role-specific dashboard
7. Pending/rejected users see the Pending Approval page

---

## Programs Offered

**Nalanda University:**
- B.Sc (Hons.) Data Science
- B.Sc (Hons.) Computer Science
- B.Sc (Hons.) Environmental Science
- BBA (Hons.)
- B.A. Sustainable Development

**GGSIP University / IP University:**
- B.Tech Computer Science & Engineering
- B.Tech Artificial Intelligence & Data Science
- B.Tech Artificial Intelligence & Machine Learning

---

## Contact

- **Website:** https://tribhuvancollege.ac.in
- **Email:** info@tribhuvancollege.ac.in
- **Phone:** +91-8890786666
- **Address:** Neemrana, Rajasthan 301705

---

## License

Private — Tribhuvan College © 2026
