# Enterprise AI Knowledge Base — Frontend

Next.js 15 (App Router, TypeScript) frontend for the internal RAG knowledge base. Admins manage
categories and PDF documents; employees (and admins) chat with a streamed, citation-backed
assistant grounded only in the uploaded documents. The FastAPI backend lives in the sibling
`../organisation-chatboat-backend` repo and is planned/documented separately.

## Architecture

**BFF (backend-for-frontend) auth pattern.** The FastAPI backend issues a raw JWT with no
cookies. This app never lets that token reach client-side JS:

- `app/api/auth/login|logout|me/route.ts` — login calls FastAPI, then sets the JWT in an
  **httpOnly** cookie (`session`); `me` decodes that cookie server-side for the current user;
  logout clears it.
- `app/api/backend/[...path]/route.ts` — a **single generic proxy** for every other FastAPI
  endpoint. Reads the cookie, attaches `Authorization: Bearer <token>` server-side, and streams
  both the request body (multipart uploads) and response body (the chat endpoint's SSE stream)
  straight through. All client code calls `/api/backend/*`, never the FastAPI URL directly — that
  URL (`BACKEND_URL`) only exists server-side (`lib/env.ts`).
- `middleware.ts` — redirects unauthenticated requests to `/login`, decodes the JWT's `role`
  claim (no signature check — FastAPI is the real enforcement point) to redirect employees away
  from `/admin/**` to `/unauthorized`, and sends `/` to `/admin` or `/chat` based on role.

**Data layer:** `services/*.ts` are thin per-resource wrappers around `services/api-client.ts`
(which hits the `/api/backend` proxy); `hooks/use-*.ts` wrap those in React Query for
list/create/update/delete with cache invalidation. The chat endpoint is the one exception —
`hooks/use-chat-stream.ts` hand-parses the backend's `event:`/`data:` SSE framing (not React
Query, since it's a stream, not a request/response) into token/citations/done events.

**UI kit:** shadcn/ui on top of **Base UI** (not Radix) — this project's `npx shadcn init` picked
up whatever the registry served, and by the time this was built shadcn had migrated its
underlying primitives to `@base-ui/react`. The practical difference from "classic" shadcn: there
is no `asChild` prop — composition uses a `render` prop instead, e.g.
`<Button render={<Link href="/chat" />}>Text</Button>`. The `components/ui/form.tsx` wrapper
(react-hook-form integration) wasn't served by the registry as buildable code for this version,
so it's hand-written here using plain `React.cloneElement` instead of a Radix/Base-UI-specific
slot primitive — keeps it working regardless of which primitives library is under `components/ui`.

## Requirements

- Node.js 20 — this machine doesn't have Node on `PATH` by default; it's managed via `nvm`:
  ```bash
  source ~/.nvm/nvm.sh && nvm use 20
  ```
- The FastAPI backend running (see `../organisation-chatboat-backend/README.md`) for real data. Without it, pages
  still render but data-fetching calls will fail — see Testing below for how the E2E suite avoids
  needing a live backend at all.

## Setup

```bash
npm install
cp .env.local.example .env.local   # BACKEND_URL — server-only, defaults to http://localhost:8000
npm run dev                        # http://localhost:3000
```

There's no signup page (matches the given page list) — bootstrap the first admin user directly
against the backend, then log in through `/login`:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"secret123","role":"admin"}'
```

## Scripts

```bash
npm run dev        # dev server (Turbopack)
npm run build      # production build
npm run lint       # ESLint
npm run test:e2e   # Playwright E2E suite
```

## Testing

`tests/e2e/*.spec.ts` cover login + role-based redirects, role-gating (`/admin` blocked for
employees), category CRUD, document upload with status polling, and the chat flow (grounded
answer + citations, the exact "not found" fallback string, clear conversation).

These tests mock every `/api/backend/*` and `/api/auth/*` response via Playwright's
`page.route()` rather than requiring a live FastAPI + Postgres + Qdrant + OpenAI stack — this
keeps the suite fast, deterministic, and runnable without any backend infrastructure. This is a
deliberate tradeoff: it verifies the frontend's own logic (routing, streaming/SSE parsing, form
validation, cache invalidation) thoroughly, but does **not** catch backend contract drift. Run a
manual smoke pass against the real backend (see the root plan's verification steps) before
shipping a release.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `BACKEND_URL` | server-only | FastAPI base URL. Never prefix with `NEXT_PUBLIC_` — the whole point of the proxy is that this never reaches the browser. |

## Known gotchas

- **Next.js version pin:** `create-next-app@latest` will grab whatever is newest (Next 16 at the
  time this was built); the spec calls for Next.js 15, so scaffolding used `create-next-app@15`
  explicitly. Don't let `next` drift to a major version bump without checking this still matters.
- **Workspace root inference:** the parent `Workspace/` directory has unrelated projects with
  their own lockfiles, which made Next.js guess the wrong monorepo root. Pinned via
  `turbopack.root` in `next.config.ts` — don't remove that if you see workspace-root warnings
  return.
- **`StreamingResponse` + cookies:** not a frontend gotcha per se, but relevant here — the BFF
  proxy passes the backend's SSE stream straight through; if you ever add response
  post-processing to the proxy route, remember the stream is being read by the browser in real
  time, not buffered.
