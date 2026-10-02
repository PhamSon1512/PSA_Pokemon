# CMS Fullstack

> A full-stack CMS running on **Cloudflare Workers** — powered by React Router v7 (SSR), Drizzle ORM + D1, R2 file storage, and a complete RBAC system. All API routes are React Router loaders/actions; no separate API framework is used.

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](CHANGELOG.md)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=react-router)](https://reactrouter.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Routes](#api-routes)
- [RBAC System](#rbac-system)
- [Admin Dashboard](#admin-dashboard)
- [Useful Scripts](#useful-scripts)
- [Deploy to Cloudflare](#deploy-to-cloudflare)
- [Development Workflow](#development-workflow)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Workers                       │
│                 (workers/app.ts — entry point)               │
│                                                             │
│   ┌───────────────────────────────────────────────────┐    │
│   │               React Router v7 (SSR)                │    │
│   │                                                     │    │
│   │  GET  /admin/*   → Server-rendered admin dashboard │    │
│   │  GET  /login     → Login page                      │    │
│   │  GET  /api/*     → loader()  → JSON response       │    │
│   │  POST /api/*     → action()  → JSON response       │    │
│   └─────────────────────────┬───────────────────────────┘   │
│                             │                               │
│               ┌─────────────▼──────────────┐               │
│               │         Drizzle ORM         │               │
│               └──────┬──────────────┬───────┘               │
│                      │              │                        │
│               ┌──────▼──────┐ ┌────▼──────┐                │
│               │  D1 (SQLite)│ │ R2 (Files)│                │
│               └─────────────┘ └───────────┘                │
│                                                             │
│  + KV (cache)   + Rate Limiter (3 tiers)                    │
└─────────────────────────────────────────────────────────────┘
```

**Request flow:**

1. Every request hits `workers/app.ts` (Cloudflare Worker)
2. Delegated to React Router's `createRequestHandler`
3. `/api/*` routes → `loader()` or `action()` → runs server guard (JWT + RBAC) → returns JSON
4. All other routes → SSR HTML rendered by React Router

---

## Tech Stack

### Frontend

| Library       | Version | Role                                  |
| ------------- | ------- | ------------------------------------- |
| React         | 19.x    | UI framework                          |
| React Router  | 7.13    | Routing + SSR (all API routes too)    |
| Tailwind CSS  | 4.x     | Styling                               |
| shadcn/ui     | —       | UI component library (Radix UI based) |
| @mantine/form | 8.x     | Form state management & validation    |
| framer-motion | 12.x    | Animations                            |
| sonner        | 2.x     | Toast notifications                   |
| lucide-react  | 0.562   | Icons                                 |
| valtio        | 2.x     | Global state management               |
| @xyflow/react | 12.x    | Flow/graph diagrams                   |

### Server (runs inside React Router loaders/actions)

| Library              | Version | Role                              |
| -------------------- | ------- | --------------------------------- |
| Drizzle ORM          | 0.44    | Type-safe SQL ORM                 |
| drizzle-zod          | 0.7     | Schema → Zod bridge               |
| Zod                  | 3.x     | Request validation                |
| @hono/zod-openapi    | 0.19    | OpenAPI schema definitions        |
| @paralleldrive/cuid2 | 2.x     | Collision-resistant ID generation |
| hono/jwt             | —       | JWT sign/verify helpers only      |
| hono/cookie          | —       | `generateCookie` helper only      |

> **Note:** Hono is **not** used as an API framework. Only its standalone utility helpers (`hono/jwt`, `hono/cookie`) are imported directly.

### Cloudflare Infrastructure

| Service      | Binding                  | Purpose                       |
| ------------ | ------------------------ | ----------------------------- |
| D1 Database  | `DB`                     | SQLite database (persistent)  |
| R2 Bucket    | `STORAGE`                | File & media storage          |
| KV Namespace | `CACHE`                  | Cache layer                   |
| Rate Limiter | `API_RATE_LIMITER`       | General API (100 req/60s)     |
| Rate Limiter | `FREE_USER_RATE_LIMITER` | Free tier users (100 req/60s) |
| Rate Limiter | `PAID_USER_RATE_LIMITER` | Paid users (1000 req/60s)     |

### Dev Tooling

| Tool                   | Purpose                               |
| ---------------------- | ------------------------------------- |
| Wrangler 4.x           | Cloudflare CLI (dev, deploy, D1, R2)  |
| drizzle-kit            | Generate & apply DB migrations        |
| Husky + lint-staged    | Pre-commit: auto-format with Prettier |
| Prettier               | Code formatting                       |
| GitNexus               | Code intelligence & impact analysis   |
| commit-and-tag-version | Semver bump + CHANGELOG generation    |

---

## Project Structure

```
cms-fullstack/
├── app/                          # React Router application
│   ├── .server/                  # Server-only code (never bundled to client)
│   │   ├── services/             # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── post.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user-meta.service.ts
│   │   │   ├── media.service.ts
│   │   │   ├── category.service.ts
│   │   │   ├── tag.service.ts
│   │   │   ├── comment.service.ts
│   │   │   ├── post-meta.service.ts
│   │   │   ├── rbac.service.ts
│   │   │   ├── menu.service.ts
│   │   │   └── settings.service.ts
│   │   ├── db.ts                 # Drizzle DB instance factory
│   │   ├── guard.ts              # requireAuth / requirePermission
│   │   ├── jwt.ts                # signJwt / verifyJwt (uses hono/jwt)
│   │   ├── session.ts            # Cookie helpers (uses hono/cookie)
│   │   ├── password.ts           # PBKDF2 password hashing
│   │   ├── rbac.ts               # RBAC engine
│   │   ├── errorHandler.ts       # withErrorHandling wrapper
│   │   ├── errors.ts             # Custom error classes
│   │   ├── logger.ts             # Structured logger
│   │   ├── response.ts           # ok / created / badRequest helpers
│   │   └── validators.ts         # parseQuery utility
│   │
│   ├── components/               # Shared UI components
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities (cn, http client, etc.)
│   │
│   ├── models/                   # Drizzle schema — defines DB tables
│   │   ├── user.ts
│   │   ├── post.ts
│   │   ├── media.ts
│   │   ├── category.ts
│   │   ├── tag.ts
│   │   ├── comment.ts
│   │   ├── menu.ts
│   │   ├── setting.ts
│   │   ├── rbac.ts
│   │   ├── junction.ts
│   │   └── relations.ts
│   │
│   ├── openapi/                  # OpenAPI route definitions (zod-openapi)
│   │
│   ├── routes/
│   │   ├── (main)+/              # Public pages
│   │   ├── admin+/               # Admin dashboard (auth-gated)
│   │   │   ├── _layout.tsx       # Sidebar + nav layout
│   │   │   ├── _index/           # Dashboard home
│   │   │   ├── users/            # User management
│   │   │   ├── media/            # Media library
│   │   │   ├── rbac/             # Role & permission management
│   │   │   └── settings/         # Site settings
│   │   ├── api+/                 # REST API (loader = GET, action = POST/PATCH/DELETE)
│   │   │   ├── auth.login.ts     # POST — login, set cookies
│   │   │   ├── auth.register.ts  # POST — register
│   │   │   ├── auth.refresh.ts   # POST — refresh access token
│   │   │   ├── auth.me.ts        # GET  — current user info
│   │   │   ├── posts.ts          # GET list / POST create
│   │   │   ├── posts.$id.ts      # GET / PATCH / DELETE post
│   │   │   ├── users.ts          # GET list / POST create
│   │   │   ├── users.$id.ts      # GET / PATCH / DELETE user
│   │   │   ├── categories.ts     # GET / POST
│   │   │   ├── categories.$id.ts # GET / PATCH / DELETE
│   │   │   ├── tags.ts           # GET / POST
│   │   │   ├── tags.$id.ts       # GET / PATCH / DELETE
│   │   │   ├── comments.ts       # GET / POST
│   │   │   ├── comments.$id.ts   # GET / PATCH / DELETE
│   │   │   ├── media.ts          # GET list / POST upload
│   │   │   ├── media.$id.ts      # GET / PATCH / DELETE
│   │   │   ├── settings.ts       # GET / POST
│   │   │   ├── admin.roles.ts    # RBAC role management
│   │   │   ├── admin.permissions.ts
│   │   │   ├── admin.sync.ts     # Sync routes → permissions
│   │   │   ├── admin.seed.ts     # Seed default roles & permissions
│   │   │   ├── health.ts         # GET /api/health
│   │   │   ├── docs.ts           # Swagger UI
│   │   │   └── openapi.ts        # OpenAPI JSON spec
│   │   └── login.tsx
│   │
│   ├── root.tsx
│   └── app.css
│
├── workers/
│   ├── app.ts                    # Cloudflare Worker entry point
│   └── env-validator.ts          # Validates required env vars at startup
│
├── migrations/                   # SQL migration files (drizzle-kit generated)
│
├── scripts/
│   ├── seed-admin.mjs            # Interactive script to create first admin user
│   └── setup-wrangler.mjs        # Create Cloudflare D1 / R2 / KV resources
│
├── public/                       # Static assets
├── wrangler.jsonc                # Cloudflare Workers config
├── drizzle.config.ts             # Drizzle config (points to D1)
├── react-router.config.ts        # React Router config (flat-routes)
├── vite.config.ts                # Vite + Cloudflare plugin config
└── package.json
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- A **Cloudflare account** with Wrangler authenticated (`npx wrangler login`)

### Step 1 — Clone & install

```bash
git clone https://github.com/vunamhung/cms-fullstack.git
cd cms-fullstack
npm install
```

### Step 2 — Configure environment

```bash
cp .env.sample .env
```

Create `.dev.vars` for local Worker secrets (Wrangler reads this automatically):

```bash
# .dev.vars
JWT_SECRET=your-super-secret-key-here
```

### Step 3 — Setup Cloudflare resources

> Requires `wrangler login` first.

```bash
# Automatically create D1, R2, and KV on Cloudflare and update wrangler.jsonc
npm run setup:wrangler
```

### Step 4 — Initialize the database

```bash
# Apply migrations to local D1
npm run db:apply:local

# Seed the first admin user (interactive — asks for email & password)
npm run seed:admin
```

### Step 5 — Start the dev server

```bash
npm run dev
```

App runs at **`http://localhost:5173`**

Log in at `/login` with the admin credentials you just created.

---

## Environment Variables

### `.env` — Vite / client-side

```bash
VITE_RESEND_API_KEY=re_xxx           # Resend API key (email sending)
```

### `.dev.vars` — Cloudflare Worker secrets (local only)

```bash
JWT_SECRET=your-jwt-secret
```

### `wrangler.jsonc` — Cloudflare vars (non-secret)

```jsonc
"vars": {
  "ENVIRONMENT": "development",
  "R2_PUBLIC_URL": "https://pub-xxx.r2.dev"   // Public CDN URL for R2 bucket
}
```

---

## Database

Uses **Drizzle ORM** on top of **Cloudflare D1** (SQLite).

### Generate a new migration

After modifying any schema file in `app/models/`:

```bash
npm run db:generate
```

### Apply migrations

```bash
npm run db:apply:local     # → local D1 (dev)
npm run db:apply:remote    # → Cloudflare D1 (production)
```

### Schema overview

| Table              | Description                                    |
| ------------------ | ---------------------------------------------- |
| `users`            | User accounts, roles                           |
| `user_meta`        | Extensible user metadata (key/value)           |
| `posts`            | Posts & pages (multi-type support)             |
| `post_meta`        | Extensible post metadata (key/value)           |
| `categories`       | Post categories                                |
| `tags`             | Post tags                                      |
| `comments`         | Comments on posts                              |
| `media`            | Media library records (files stored in R2)     |
| `menus`            | Navigation menus                               |
| `settings`         | Site-wide settings                             |
| `roles`            | RBAC roles                                     |
| `permissions`      | RBAC permissions (auto-discovered from routes) |
| `role_permissions` | Junction: role ↔ permission                    |

---

## API Routes

All API endpoints are **React Router `loader` (GET) and `action` (POST/PATCH/DELETE)** functions — no separate API server.

### Browsing the API docs

When the dev server is running:

- **Swagger UI:** `http://localhost:5173/api/docs` — interactive Swagger UI (served as plain HTML via `docs.ts` loader, loads spec from `/api/openapi`)
- **OpenAPI JSON:** `http://localhost:5173/api/openapi` — raw OpenAPI spec

### Endpoint reference

| Method               | Endpoint                     | Description                              |
| -------------------- | ---------------------------- | ---------------------------------------- |
| GET                  | `/api/health`                | Health check                             |
| POST                 | `/api/auth/login`            | Log in — returns JWT, sets cookies       |
| POST                 | `/api/auth/register`         | Register a new account                   |
| POST                 | `/api/auth/refresh`          | Refresh access token via HttpOnly cookie |
| GET                  | `/api/auth/me`               | Get current authenticated user           |
| GET / POST           | `/api/posts`                 | List posts / create post                 |
| GET / PATCH / DELETE | `/api/posts/:id`             | Get / update / delete post               |
| GET / POST           | `/api/users`                 | List users / create user                 |
| GET / PATCH / DELETE | `/api/users/:id`             | Get / update / delete user               |
| GET / POST           | `/api/categories`            | List / create categories                 |
| GET / PATCH / DELETE | `/api/categories/:id`        | Get / update / delete category           |
| GET / POST           | `/api/tags`                  | List / create tags                       |
| GET / PATCH / DELETE | `/api/tags/:id`              | Get / update / delete tag                |
| GET / POST           | `/api/comments`              | List / create comments                   |
| GET / PATCH / DELETE | `/api/comments/:id`          | Get / update / delete comment            |
| GET / POST           | `/api/media`                 | List media / upload file (multipart)     |
| GET / PATCH / DELETE | `/api/media/:id`             | Get / update / delete media record       |
| GET / POST           | `/api/settings`              | Get / update site settings               |
| GET / POST           | `/api/admin/roles`           | List / create roles                      |
| GET / PATCH / DELETE | `/api/admin/roles/:slug`     | Get / update / delete role               |
| GET / POST           | `/api/admin/permissions`     | List / create permissions                |
| DELETE               | `/api/admin/permissions/:id` | Delete permission                        |
| POST                 | `/api/admin/sync`            | Auto-sync API routes → permissions table |
| POST                 | `/api/admin/seed`            | Seed default roles & permissions         |

### Authentication

All protected endpoints require a **JWT Bearer token**:

```bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:5173/api/posts
```

- **Access token** — stored in a regular cookie (`token`) and `Authorization` header. Expires in **24h**.
- **Refresh token** — stored in an **HttpOnly cookie** (`refreshToken`). Expires in **30 days**. Used by `POST /api/auth/refresh`.

---

## RBAC System

The project implements a full **Role-Based Access Control** system with:

- Roles stored in D1 (`roles` table)
- Permissions auto-discovered from registered API routes via `POST /api/admin/sync`
- Permission format: `METHOD:path` (e.g. `GET:/api/posts`, `DELETE:/api/posts/:id`)
- Each role can be granted/revoked specific permissions
- `requirePermission(user, request)` enforces access inside each route handler

### Default roles

| Role          | Description                    |
| ------------- | ------------------------------ |
| `admin`       | Full access                    |
| `editor`      | Manage all content             |
| `author`      | Create & edit own posts        |
| `contributor` | Create drafts (cannot publish) |
| `subscriber`  | Read-only access               |

### Seeding default roles & permissions

Via API (requires admin token):

```bash
POST /api/admin/seed
```

Or through the Admin Dashboard at `/admin/rbac`.

---

## Admin Dashboard

Accessible at `/admin` after login.

| Route             | Page                | Description              |
| ----------------- | ------------------- | ------------------------ |
| `/admin`          | Dashboard           | Overview                 |
| `/admin/users`    | Users               | Manage user accounts     |
| `/admin/media`    | Media Library       | Upload & manage files    |
| `/admin/rbac`     | Roles & Permissions | Configure access control |
| `/admin/settings` | Settings            | Site configuration       |

---

## Useful Scripts

```bash
# Development
npm run dev              # Start local dev server with HMR (Wrangler + Vite)
npm run build            # Build for production
npm run preview          # Build + preview production locally
npm run typecheck        # Full type check (Cloudflare types + React Router types + tsc)
npm run cf-typegen       # Regenerate Cloudflare Worker type bindings

# Database
npm run db:generate      # Generate a new migration from schema changes
npm run db:apply:local   # Apply migrations → local D1
npm run db:apply:remote  # Apply migrations → production D1

# Seeding
npm run seed:admin       # Create first admin user (local)
npm run seed:admin:remote  # Create first admin user (production)

# Setup
npm run setup:wrangler   # Create Cloudflare D1 / R2 / KV resources

# Release
npm run release          # Bump semver + update CHANGELOG.md
```

---

## Deploy to Cloudflare

### First-time setup

**1. Authenticate Wrangler:**

```bash
npx wrangler login
```

**2. Create Cloudflare resources:**

```bash
npm run setup:wrangler
```

**3. Apply migrations to production D1:**

```bash
npm run db:apply:remote
```

**4. Seed the production admin user:**

```bash
npm run seed:admin:remote
```

**5. Deploy:**

```bash
npm run deploy
```

### Preview deployments

Upload a preview version without touching production:

```bash
npx wrangler versions upload
```

Promote to production (or progressive rollout) after verification:

```bash
npx wrangler versions deploy
```

---

## Development Workflow

### Pre-commit hooks

Husky runs **lint-staged** before every commit:

- Formats `*.{js,ts,tsx,json,md}` with Prettier automatically

### Route conventions (remix-flat-routes)

Files in `app/routes/` map directly to URLs:

| File                 | URL                                                    |
| -------------------- | ------------------------------------------------------ |
| `admin+/_layout.tsx` | Layout wrapper for `/admin/*`                          |
| `api+/posts.ts`      | `GET /api/posts` (loader) + `POST /api/posts` (action) |
| `api+/posts.$id.ts`  | `/api/posts/:id`                                       |
| `(main)+/_index.tsx` | `/`                                                    |

### Code intelligence (GitNexus)

GitNexus indexes the codebase into a knowledge graph so AI agents have full architectural context — every call chain, dependency, and execution flow.

**Daily commands:**

```bash
npx gitnexus status          # Check if the index is up to date
npx gitnexus analyze         # Re-index after large changes
npx gitnexus analyze --force # Force full re-index
npx gitnexus wiki            # Generate wiki documentation
```

**Before editing any symbol**, run an impact analysis to understand the blast radius:

```bash
# Who calls this function? What breaks if I change it?
npx gitnexus impact <symbolName> upstream
```

> Full mandatory workflow for agents → see `AGENTS.md`.

---

## GitNexus MCP Setup

[GitNexus](https://github.com/abhigyanpatwari/GitNexus) is a code intelligence engine that indexes your repository into a knowledge graph and exposes it to AI agents (Cursor, Claude Code, etc.) via the **Model Context Protocol (MCP)**. It tracks every dependency, call chain, and execution flow so agents don't miss context when editing code.

### Step 1 — Install globally

```bash
npm install -g gitnexus
```

### Step 2 — Index this repository

Run once from the project root. This builds the knowledge graph, installs agent skills, registers Claude Code hooks, and generates `AGENTS.md` / `CLAUDE.md`:

```bash
npx gitnexus analyze
```

To force a full re-index at any time:

```bash
npx gitnexus analyze --force
```

### Step 3 — Configure MCP for your editor (one-time)

Auto-detect your editors and write the correct global MCP config:

```bash
npx gitnexus setup
```

Or configure manually per editor:

#### Claude Code

```bash
claude mcp add gitnexus -- npx -y gitnexus@latest mcp
```

> Claude Code gets the deepest integration: MCP tools + agent skills + `PreToolUse` hooks that enrich searches with graph context + `PostToolUse` hooks that auto-reindex after commits.

#### Cursor

Add to `~/.cursor/mcp.json` (global — works for all projects):

```json
{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
```

#### Codex

Add to `~/.codex/config.toml` (system scope) or `.codex/config.toml` (project scope):

```toml
[mcp_servers.gitnexus]
command = "npx"
args = ["-y", "gitnexus@latest", "mcp"]
```

#### OpenCode

Add to `~/.config/opencode/config.json`:

```json
{
  "mcp": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
```

### CLI Reference

```bash
gitnexus setup                     # Configure MCP for your editors (one-time)
gitnexus analyze [path]            # Index a repository (or update stale index)
gitnexus analyze --force           # Force full re-index
gitnexus analyze --skills          # Generate repo-specific skill files
gitnexus analyze --skip-embeddings # Skip embedding generation (faster)
gitnexus analyze --embeddings      # Enable embedding generation (better search)
gitnexus analyze --verbose         # Log skipped files
gitnexus mcp                       # Start MCP server (stdio)
gitnexus serve                     # Start local HTTP server for web UI connection
gitnexus list                      # List all indexed repositories
gitnexus status                    # Show index status for current repo
gitnexus clean                     # Delete index for current repo
gitnexus clean --all --force       # Delete all indexes
gitnexus wiki [path]               # Generate repository wiki from knowledge graph
```

---

## AI-Assisted Development

This project ships with two AI workflow systems built on top of your AI editor (Cursor, Claude Code, etc.).

### BMAD Agents

**BMAD** (Build with Method, Architect, and Develop) is a set of role-based AI agent personas stored in `.agent/workflows/`. Each agent is activated by typing a slash command in your AI chat.

| Slash Command                | Agent       | Role                                            |
| ---------------------------- | ----------- | ----------------------------------------------- |
| `/agent:quick-flow-solo-dev` | Barry 🚀    | Rapid end-to-end feature delivery (recommended) |
| `/agent:dev`                 | Dev         | Implementation & coding tasks                   |
| `/agent:architect`           | Architect   | Technical design & system architecture          |
| `/agent:pm`                  | PM          | Roadmap, backlog & product decisions            |
| `/agent:analyst`             | Analyst     | Requirements & stakeholder analysis             |
| `/agent:qa`                  | QA          | Testing, quality assurance & test planning      |
| `/agent:sm`                  | SM          | Sprint planning & ceremonies                    |
| `/agent:ux-designer`         | UX Designer | Wireframes & UX specifications                  |
| `/agent:tech-writer`         | Tech Writer | Documentation & guides                          |

#### Recommended starting agent: Quick Flow Solo Dev

Type `/agent:quick-flow-solo-dev` in your AI chat. The agent (Barry) will greet you and show a menu:

```
[QS] Quick Spec    — create a lean, implementation-ready tech spec
[QD] Quick Dev     — implement a story/spec end-to-end
[QQ] Quick Dev New — unified: clarify → plan → implement → review (experimental)
[CR] Code Review   — multi-faceted code review
[PM] Party Mode    — spin up all agents for group discussion
[DA] Dismiss Agent
```

**Example workflow:**

```
You → /agent:quick-flow-solo-dev
Barry: (greets, shows menu)

You → QS   # or type "quick spec" or just "1"
Barry: asks clarifying questions, produces a tech spec

You → QD   # implement the spec
Barry: implements the feature end-to-end following project conventions
```

---

### UI/UX Pro Max

`/ui-ux-pro-max` is a design intelligence workflow that searches a curated database of UI styles, color palettes, typography pairings, UX guidelines, and stack-specific best practices — then synthesizes them into production-ready UI code.

#### How to trigger

Type `/ui-ux-pro-max` in your AI chat, followed by your UI request:

```
/ui-ux-pro-max  Build a dashboard page for post analytics
/ui-ux-pro-max  Create a login page with glassmorphism dark mode
/ui-ux-pro-max  Design a media upload modal with drag & drop
```

#### What the agent does internally

The workflow runs a search script against a local knowledge base before writing any code:

```bash
# 1. Product type recommendations
python3 .shared/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --domain product

# 2. Style guide (colors, effects, frameworks)
python3 .shared/ui-ux-pro-max/scripts/search.py "dark minimal" --domain style

# 3. Font pairings
python3 .shared/ui-ux-pro-max/scripts/search.py "professional modern" --domain typography

# 4. Color palette
python3 .shared/ui-ux-pro-max/scripts/search.py "saas fintech" --domain color

# 5. UX best practices (always searched)
python3 .shared/ui-ux-pro-max/scripts/search.py "animation" --domain ux
python3 .shared/ui-ux-pro-max/scripts/search.py "accessibility" --domain ux

# 6. Stack-specific guidelines (defaults to html-tailwind; override if needed)
python3 .shared/ui-ux-pro-max/scripts/search.py "layout responsive" --stack react
```

#### Available search domains

| Domain       | Purpose                                   |
| ------------ | ----------------------------------------- |
| `product`    | Style recommendations by product type     |
| `style`      | UI styles, effects (glassmorphism, etc.)  |
| `typography` | Font pairings & Google Fonts imports      |
| `color`      | Full color palettes by industry           |
| `landing`    | Landing page structures & CTA strategies  |
| `chart`      | Chart type recommendations for dashboards |
| `ux`         | Best practices & anti-patterns            |

#### Available stacks

`html-tailwind` (default) · `react` · `nextjs` · `vue` · `svelte` · `react-native` · `flutter` · `swiftui`

> **Note:** This project uses **React + Tailwind CSS**, so the agent defaults to the `react` or `html-tailwind` stack automatically.

---

## Links

- [GitNexus](https://github.com/abhigyanpatwari/GitNexus)
- [React Router v7 Docs](https://reactrouter.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [shadcn/ui](https://ui.shadcn.com/)
- [CHANGELOG](CHANGELOG.md)

# PSA_Pokemon
