# DataBlog — Social Media App

A full-stack social media web application built as a DBMS project, demonstrating real-world raw SQL usage with a modern Next.js frontend.

---

### What's inside

```
DataBlog/
└── social_app/          # The Next.js 16 application
    ├── app/             # App Router pages & API routes
    │   ├── page.tsx         # Home feed
    │   ├── login/           # Login page
    │   ├── signup/          # Sign-up page
    │   ├── create/          # Create post page
    │   ├── profile/[id]/    # User profile page (dynamic)
    │   └── api/             # REST API handlers
    │       ├── auth/
    │       │   ├── register/    # POST  – create account
    │       │   ├── login/       # POST  – sign in (sets JWT cookie)
    │       │   ├── logout/      # POST  – clears auth cookie
    │       │   └── me/          # GET   – current user from cookie
    │       ├── posts/           # GET (feed) / POST (new post)
    │       ├── like/            # POST  – toggle like on a post
    │       ├── comment/         # POST  – add a comment
    │       ├── follow/          # POST  – toggle follow/unfollow
    │       └── users/
    │           ├── route.ts     # GET   – list all users
    │           └── [id]/        # GET   – single user profile + stats
    ├── components/      # Shared React components (Navbar, PostCard, …)
    ├── lib/
    │   ├── db.ts        # MySQL connection pool (auto-initialises schema)
    │   ├── initDb.ts    # CREATE TABLE IF NOT EXISTS for all 5 tables
    │   └── auth.ts      # JWT sign / verify / getAuthUser helper
    └── DATABASE.md      # Full schema reference & ER diagram
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database driver | [mysql2](https://github.com/sidorares/node-mysql2) (raw SQL, no ORM) |
| Auth | JSON Web Tokens via `jsonwebtoken` + HTTP-only cookie |
| Password hashing | `bcryptjs` |
| Database | MySQL (hosted on [Aiven](https://aiven.io/)) |

> **No ORM.** The project deliberately uses raw parameterised SQL queries to demonstrate DBMS concepts clearly.

---

## Database Schema

Five tables, created automatically on first startup via `lib/initDb.ts`:

```
User ──< Post ──< Like
     ──< Comment
     ──< Follow (self-referencing)
```

| Table | Purpose |
|---|---|
| `User` | Accounts — id, username, email, hashed password |
| `Post` | User-created content with optional image URL |
| `Like` | Join table — one row per (user, post) pair |
| `Comment` | Text replies linked to a post and its author |
| `Follow` | Follower / following relationship between users |

All foreign keys use `ON DELETE CASCADE`.  
See [`social_app/DATABASE.md`](./social_app/DATABASE.md) for the full ER diagram and column-level details.

---

## How the schema initialises automatically

`lib/db.ts` creates the MySQL connection pool and immediately calls `lib/initDb.ts`, which runs `CREATE TABLE IF NOT EXISTS` for every table **in dependency order** before any route handler can execute. This means:

- Fresh database → all tables created on first request.
- Existing database → statement is a no-op, data is untouched.
- No manual migration step required.

---

## Features

- **Authentication** — cookie-based JWT auth (register, login, logout).
- **Feed** — paginated list of all posts with author, like count, and comments.
- **Posts** — create a post with text content (image URL optional).
- **Likes** — toggle like / unlike on any post.
- **Comments** — add a comment to any post.
- **Follow system** — follow / unfollow other users; follower & following counts shown on profiles.
- **User profiles** — public profile page with post history and follow stats.

---

## Running locally

### Prerequisites
- Node.js 20+
- A MySQL database (local or remote, e.g. Aiven free tier)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Nithin0620/DataBlog.git
cd DataBlog/social_app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in DATABASE_URL and JWT_SECRET

# 4. Start the dev server
#    The schema is created automatically on first request.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` | Full MySQL connection URI |
| `JWT_SECRET` | `some-long-random-string` | Secret used to sign auth tokens |

### Production build

```bash
npm run build
npm run start
```

---

## Project structure highlights

```
app/api/          ← All backend logic lives here as Next.js Route Handlers
lib/db.ts         ← Single connection pool shared across the whole app
lib/initDb.ts     ← Schema bootstrap — CREATE TABLE IF NOT EXISTS
lib/auth.ts       ← Server-side auth helpers (no client-side secrets)
```

---

## License

MIT — see [LICENSE](./LICENSE).