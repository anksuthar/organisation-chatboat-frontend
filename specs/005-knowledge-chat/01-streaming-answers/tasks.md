# Tasks: Streaming Answers

**Input**: `specs/005-knowledge-chat/01-streaming-answers/` (spec.md, plan.md), `../contracts/chat-stream.md`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 Catch-all BFF proxy streams request/response bodies unbuffered in app/api/backend/[...path]/route.ts
- [X] T002 [P] Define `ChatMessage` and event payload types in types/chat.ts
- [X] T003 [P] Implement `postChatQuestion` (POST `{question}`, returns raw Response) in services/chat.ts

## Phase 2: User Story 1 - Ask and stream (P1) MVP

- [X] T004 [US1] Implement `parseSseBlock` (event/data lines, multi-line data join, default `message`) in hooks/use-chat-stream.ts
- [X] T005 [US1] Implement `sendMessage` reader loop with `\n\n` block buffering and `token`/`done` handling in hooks/use-chat-stream.ts
- [X] T006 [US1] Optimistic user + placeholder assistant message with UUID ids in hooks/use-chat-stream.ts
- [X] T007 [P] [US1] Chat input with Enter-to-send, Shift+Enter newline, trim check, disabled state in components/chat/chat-input.tsx
- [X] T008 [P] [US1] Typing indicator in components/chat/typing-indicator.tsx, shown for empty streaming message in components/chat/chat-message-bubble.tsx
- [X] T009 [US1] Page wiring + smooth auto-scroll on message change in app/(protected)/chat/page.tsx
- [X] T010 [US1] Invalidate `["chat","history"]` in `finally` in hooks/use-chat-stream.ts
- [X] T011 [US1] E2E: "asking a grounded question streams an answer with a citation" in tests/e2e/chat.spec.ts

## Phase 3: User Story 2 - Starter questions (P3)

- [X] T012 [US2] Static starter chips in components/chat/suggested-questions.tsx, rendered on empty thread after history loads in app/(protected)/chat/page.tsx
- [ ] T013 [US2] GAP: E2E test clicking a starter chip and asserting POST body `question` in tests/e2e/chat.spec.ts

## Phase 4: User Story 3 - Failure recovery (P2)

- [X] T014 [US3] Catch block keeps partial content or sets fallback text, `finally` re-enables input in hooks/use-chat-stream.ts
- [ ] T015 [US3] GAP: E2E test for non-2xx response showing "Something went wrong reaching the chat service. Please try again." in tests/e2e/chat.spec.ts
- [X] T016 [US3] GAP: When the stream ends without a `done` event, the message's `isStreaming` stays `true` (copy button/suggestions never show, empty bubble keeps typing indicator) — clear it after the read loop exits in hooks/use-chat-stream.ts — FIXED (2026-11-16): `finally` now clears the assistant message's `isStreaming` (only if still true) after the read loop exits normally, by error or abort; `done` handling unchanged

## Dependencies

T001–T003 → T004–T011. US2/US3 depend on US1 hook.

## Gap summary

- T013: starter-chip story untested (Constitution IV).
- T015: error-fallback story untested (Constitution IV).
- T016: FIXED (2026-11-16) — streaming flag cleared in `finally`.

Not a gap (no requirement), noted only: no stream cancellation on unmount (spec Edge Cases).
