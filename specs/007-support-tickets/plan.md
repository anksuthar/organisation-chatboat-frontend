# Implementation Plan: Support Tickets

**Branch**: `007-support-tickets` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Two thin route files render client components that read tickets through React Query hooks →
`services/tickets.ts` → `apiFetch` → BFF proxy. Read-only; no mutations.

## Technical Context

**Language/Version**: TypeScript (strict), React 19.1, Next.js 15.5 App Router

**Primary Dependencies**: `@tanstack/react-query` v5, `date-fns` v4, shadcn/Base UI (`Table`, `Card`, `Badge`, `Button`, `Skeleton`), `lucide-react`

**Storage**: None client-side (React Query cache; `staleTime` 30 s, `retry` 1 from `app/providers.tsx`)

**Testing**: Playwright — no tickets test file exists

**Project Type**: Web frontend (BFF pattern)

## Architecture & Data Flow

```text
app/(protected)/tickets/page.tsx (server)       → <TicketTable/>  (client)
app/(protected)/tickets/[id]/page.tsx (server)  → await params → <TicketDetail ticketId={Number(id)}/> (client)

TicketTable  → useTickets()      → services/tickets.listTickets()  → apiFetch("tickets")      → GET /api/backend/tickets
TicketDetail → useTicket(id)     → services/tickets.getTicket(id)  → apiFetch(`tickets/${id}`) → GET /api/backend/tickets/{id}

Query keys: ["tickets"], ["tickets", id]. Invalidated externally by hooks/use-chat-stream.ts on `ticket` SSE event.
```

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF Security Boundary | PASS | Only `apiFetch` → `/api/backend/tickets*`. Role checks: none in frontend; backend is authority. |
| II. Layered Data Access | PASS | route → component → hook → service → api-client. One `services/tickets.ts`, one `types/ticket.ts`. No mutations, so no invalidation needed locally. |
| III. Contract-First | PASS (caveat) | `contracts/tickets.md` derived from frontend code only; no Playwright mocks exist to cross-check; not checked against backend OpenAPI. |
| IV. Test Every User Story | VIOLATION | No `tests/e2e/tickets.spec.ts`; neither list nor detail story is tested, nor role visibility. |
| V. Pinned Stack & Base UI | PASS | `Button render={<Link/>}`; no `asChild`. |
| VI. Simplicity | PASS | Minimal read-only pages. |

## Project Structure

### Documentation

```text
specs/007-support-tickets/
├── spec.md
├── plan.md
├── contracts/tickets.md
├── 01-ticket-list/{spec,plan,tasks}.md
└── 02-ticket-detail/{spec,plan,tasks}.md
```

### Source Code

```text
app/(protected)/tickets/page.tsx
app/(protected)/tickets/[id]/page.tsx
components/tickets/ticket-table.tsx
components/tickets/ticket-detail.tsx
components/tickets/ticket-status-badge.tsx
hooks/use-tickets.ts
services/tickets.ts
services/api-client.ts            # shared
types/ticket.ts
components/layout/app-sidebar.tsx # "Support Tickets" for customers only
hooks/use-chat-stream.ts          # invalidates ["tickets"]
```

## Complexity Tracking

None.
