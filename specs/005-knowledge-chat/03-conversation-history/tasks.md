# Tasks: Conversation History & Clear

**Input**: `specs/005-knowledge-chat/03-conversation-history/`, `../contracts/chat-history.md`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] `ChatHistoryEntry` type in types/chat.ts
- [X] T002 [P] `listChatHistory` / `clearChatHistory` in services/chat.ts
- [X] T003 `useChatHistory` / `useClearChatHistory` with `CHAT_HISTORY_KEY` invalidation in hooks/use-chat-history.ts

## Phase 2: User Story 1 - Resume conversation (P1) MVP

- [X] T004 [US1] `loadHistory` maps entries to question/answer messages in hooks/use-chat-stream.ts
- [X] T005 [US1] One-time hydration effect and loading-aware empty state in app/(protected)/chat/page.tsx
- [X] T006 [US1] E2E: history entry rendered on load (part of "clear conversation empties the thread") in tests/e2e/chat.spec.ts
- [X] T007 [US1] GAP: History load failure is indistinguishable from empty history — handle `isError` (message or toast) in app/(protected)/chat/page.tsx — FIXED (2026-11-16): chat page renders `<QueryError>` (with Retry → refetch) above the thread when the history query fails

## Phase 3: User Story 2 - Clear conversation (P2)

- [X] T008 [US2] Confirm dialog with "Clear conversation?" copy and Cancel/Clear; disabled when no messages in app/(protected)/chat/page.tsx
- [X] T009 [US2] `handleClear` awaits DELETE then `clearMessages()` in app/(protected)/chat/page.tsx
- [X] T010 [US2] E2E: "clear conversation empties the thread" in tests/e2e/chat.spec.ts
- [X] T011 [US2] GAP: `handleClear` has no try/catch — a failed DELETE is an unhandled rejection with no user feedback in app/(protected)/chat/page.tsx — FIXED (2026-11-16): `handleClear` wraps `mutateAsync` in try/catch; on failure toasts "Couldn't clear conversation: …" (hook has no onError toast) and keeps the local thread

## Gap summary

- T007: FIXED (2026-11-16) — QueryError above the thread.
- T011: FIXED (2026-11-16) — try/catch + toast, thread kept on failure.
