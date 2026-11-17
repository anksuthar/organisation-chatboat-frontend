# Tasks: Agent Result Cards (Commerce, Profile, Tickets)

**Input**: `specs/005-knowledge-chat/05-agent-actions/`, `../contracts/chat-stream.md`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] Summary types and `ChatMessage` fields in types/chat.ts

## Phase 2: User Story 1 - Orders/products/categories (P2)

- [X] T002 [US1] Handle `orders`, `products`, `categories` events in hooks/use-chat-stream.ts
- [X] T003 [US1] Order badges → `/orders/<id>`, product badges → `/shop/<id>`, category badges in components/chat/chat-message-bubble.tsx
- [ ] T004 [US1] GAP: E2E test for `orders`/`products`/`categories` events and their links in tests/e2e/chat.spec.ts

## Phase 3: User Story 2 - Profile link (P3)

- [X] T005 [US2] Handle `profile` event in hooks/use-chat-stream.ts; "View full profile" badge → `/profile` in components/chat/chat-message-bubble.tsx
- [ ] T006 [US2] GAP: E2E test for `profile` event badge in tests/e2e/chat.spec.ts

## Phase 4: User Story 3 - Report problem → ticket (P2)

- [X] T007 [US3] "Report a problem" link with encoded prefill in components/orders/order-detail.tsx
- [X] T008 [US3] Read `prefill` search param into `ChatInput` initial value in app/(protected)/chat/page.tsx and components/chat/chat-input.tsx
- [X] T009 [US3] Handle `ticket` event, render badge → `/tickets`, invalidate `["tickets"]` in hooks/use-chat-stream.ts and components/chat/chat-message-bubble.tsx
- [ ] T010 [US3] GAP: E2E test for `/chat?prefill=` input value and `ticket` event badge in tests/e2e/chat.spec.ts
- [X] T011 [US3] GAP (unverified): `useSearchParams()` used without a `<Suspense>` boundary — confirm `npm run build` passes or wrap the page content in `<Suspense>` in app/(protected)/chat/page.tsx — FIXED (2026-11-16): page content moved into `ChatPageContent`; default export wraps it in `<Suspense fallback={null}>`

## Gap summary

- T004, T006, T010: agent-event stories untested (Constitution IV).
- T011: FIXED (2026-11-16) — chat page content wrapped in `<Suspense>` (confirm with `npm run build`).
