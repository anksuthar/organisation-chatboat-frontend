# Implementation Plan: Platform Foundation

**Branch**: `001-platform-foundation` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-platform-foundation/spec.md` (retro-documented; code already exists)

## Summary

A Next.js 15 App Router BFF: one catch-all Route Handler proxies all backend traffic and injects the bearer token from an httpOnly cookie; a thin `apiFetch` wrapper is the single request/response entry point for `services/*.ts`; a client `Providers` component installs React Query, `next-themes`, Base UI tooltips and Sonner toasts; the `(protected)` route group wraps pages in a shadcn (Base UI) sidebar shell whose navigation is chosen by the current user's role.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.1.0, Next.js 15.5.20 (App Router, Turbopack)

**Primary Dependencies**: `@tanstack/react-query` 5, `next-themes` 0.4, `@base-ui/react` 1.6 (via shadcn/ui), `sonner` 2, `lucide-react`, Tailwind CSS 4, `axios` (used by two upload services, not by the foundation)

**Storage**: httpOnly `session` cookie (JWT); `sidebar_state` cookie (client-written); theme preference in `localStorage` via `next-themes`

**Testing**: Playwright (`tests/e2e/`, Chromium, dev server on port 3100, backend mocked with `page.route()`)

**Target Platform**: Node.js 20 server (Route Handlers, middleware) + modern browsers

**Project Type**: Web application frontend (BFF)

**Performance Goals**: No buffering of proxied bodies (streaming SSE/multipart)

**Constraints**: JWT never exposed to JS; backend URL server-only; Next.js pinned to v15; `turbopack.root` kept in `next.config.ts`

**Scale/Scope**: 1 proxy route, 1 API client, 2 layouts, 3 layout components, 1 provider tree, 1 fallback page

## Architecture & Data Flow

```text
Browser (client component)
  └─ hooks/use-*.ts            (React Query: useQuery/useMutation + invalidation)
      └─ services/<resource>.ts
          └─ services/api-client.ts  apiFetch("<path>")  → fetch("/api/backend/<path>")
              └─ app/api/backend/[...path]/route.ts   (server)
                  ├─ reads cookie "session" (lib/env.ts SESSION_COOKIE_NAME)
                  ├─ sets Authorization: Bearer <token>, forwards Content-Type
                  └─ fetch(`${BACKEND_URL}/api/v1/<path>?<query>`, body streamed, duplex "half")
                      └─ FastAPI → Response body streamed back (content-encoding/length stripped)
```

Exceptions observed in the codebase (owned by other features): `services/chat.ts` calls `fetch("/api/backend/chat")` directly for SSE (allowed by Constitution II, consumed by `hooks/use-chat-stream.ts`); `services/documents.ts` and `services/products.ts` use `axios.post("/api/backend/.../upload")` for upload progress — they still go through the proxy but bypass `api-client`.

Shell composition:

```text
app/layout.tsx (server: fonts, metadata, <html suppressHydrationWarning>)
  └─ app/providers.tsx (client: ThemeProvider → QueryClientProvider → TooltipProvider → children + Toaster)
      └─ app/(protected)/layout.tsx (SidebarProvider → AppSidebar + SidebarInset[SiteHeader + <main>])
```

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. BFF Security Boundary | PASS | Token read server-side only (`cookies()` in the proxy); `BACKEND_URL` only in `lib/env.ts`, no `NEXT_PUBLIC_`; request body streamed with `duplex: "half"`, response body passed through as a stream. Note: `lib/env.ts` relies on a comment, not `import "server-only"`, to stay out of client bundles. |
| II. Layered Data Access | PASS (with cross-feature caveat) | Foundation provides `api-client` + a single `QueryClient`. `services/documents.ts`/`services/products.ts` bypass `api-client` with axios (still via the proxy) — tracked as a gap in [02-api-client/tasks.md](02-api-client/tasks.md). |
| III. Contract-First | PASS | Generic proxy contract documented in [contracts/bff-proxy.md](contracts/bff-proxy.md); resource contracts belong to the features that use them. |
| IV. Test Every User Story | VIOLATION | Proxy forwarding, nav-per-role, theme toggle and 404 have no Playwright coverage (all E2E tests mock `/api/backend/*` in the browser, so the proxy route never executes under test). See sub-feature gap tasks. |
| V. Pinned Stack & Base UI | PASS | `next` 15.5.20; `render` prop used (`SidebarMenuButton render={<Link/>}`, `Button render={<Link/>}`); `turbopack.root` present. |
| VI. Simplicity | PASS | One generic proxy instead of per-endpoint handlers; no global store beyond React Query. |

## Project Structure

### Documentation (this feature)

```text
specs/001-platform-foundation/
├── spec.md
├── plan.md
├── contracts/
│   └── bff-proxy.md
├── 01-bff-proxy/{spec,plan,tasks}.md
├── 02-api-client/{spec,plan,tasks}.md
├── 03-app-shell-navigation/{spec,plan,tasks}.md
└── 04-theming-and-fallback-pages/{spec,plan,tasks}.md
```

### Source Code (repository root)

```text
app/
├── api/backend/[...path]/route.ts   # BFF proxy (GET/POST/PUT/DELETE)
├── layout.tsx                       # root layout, fonts, metadata
├── providers.tsx                    # React Query, next-themes, Tooltip, Toaster
├── not-found.tsx                    # 404
└── (protected)/layout.tsx           # sidebar shell for authenticated pages
components/
├── layout/app-sidebar.tsx           # role-aware navigation + logout
├── layout/site-header.tsx           # sidebar trigger, role badge, theme toggle
├── layout/theme-toggle.tsx
└── ui/{sidebar,sonner,tooltip,button,badge,separator,sheet}.tsx
hooks/use-mobile.ts                  # <768px breakpoint for sidebar
lib/env.ts                           # BACKEND_URL, SESSION_COOKIE_NAME
lib/utils.ts                         # cn()
services/api-client.ts               # apiFetch, ApiError
styles/globals.css                   # theme tokens incl. .dark
next.config.ts                       # turbopack.root
.env.local.example                   # BACKEND_URL template
```

**Structure Decision**: Single Next.js app at repo root; foundation code is shared by all feature folders.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Principle IV coverage gaps | Existing code predates the constitution | Not a justified deviation — tracked as GAP tasks to close. |
