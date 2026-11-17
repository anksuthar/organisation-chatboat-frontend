# Implementation Plan: Agent Result Cards (Commerce, Profile, Tickets)

**Branch**: `005-knowledge-chat` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Files Involved

| File | Role |
|------|------|
| `types/chat.ts` | `ChatOrderSummary`, `ChatProductSummary`, `ChatProfileSummary`, `ChatTicketSummary`; fields on `ChatMessage` |
| `hooks/use-chat-stream.ts` | `orders`/`products`/`categories`/`profile`/`ticket` handlers; `invalidateQueries({queryKey:["tickets"]})` |
| `components/chat/chat-message-bubble.tsx` | Badge rows with `render={<Link href=…/>}` |
| `app/(protected)/chat/page.tsx` | `useSearchParams().get("prefill")` → `ChatInput initialValue` |
| `components/chat/chat-input.tsx` | `useState(initialValue)` |
| `components/orders/order-detail.tsx` | "Report a problem" button → `/chat?prefill=…` |
| `hooks/use-tickets.ts` | Owns `TICKETS_KEY = ["tickets"]` (not exported; literal duplicated in use-chat-stream) |

## State & Data Flow

SSE event → `updateMessage` sets the summary field → bubble renders badges. `ticket` additionally
invalidates the tickets cache so `useTickets()`/`useTicket(id)` refetch on next mount/observe.

## Error / Loading Handling

Same as 01 (generic catch). No per-event validation.

## Risks

- `useSearchParams()` in a client page without a `<Suspense>` boundary: Next.js 15 requires one for statically prerendered routes and fails `next build` with "useSearchParams() should be wrapped in a suspense boundary". Nothing in `app/(protected)/layout.tsx` forces dynamic rendering. [NEEDS CLARIFICATION: confirm with `npm run build`; not run in this documentation pass]
- `["tickets"]` key literal duplicated across `hooks/use-chat-stream.ts` and `hooks/use-tickets.ts`.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I | PASS | Via proxy. |
| II | PASS | Cross-feature cache invalidation from the stream hook. |
| III | PASS (caveat) | Event shapes in `../contracts/chat-stream.md`; backend specs 036–040 referenced in `types/chat.ts` comment, not read. |
| IV | VIOLATION | No Playwright test for any agent event, the prefill flow, or ticket-cache invalidation. |
| V | PASS | `Badge render={<Link/>}`, `Button render={<Link/>}`. |
| VI | PASS | — |
