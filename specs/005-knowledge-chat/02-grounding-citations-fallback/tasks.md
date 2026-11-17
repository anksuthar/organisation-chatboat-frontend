# Tasks: Grounding — Citations, Not-Found Fallback, Follow-up Suggestions

**Input**: `specs/005-knowledge-chat/02-grounding-citations-fallback/`, `../contracts/chat-stream.md`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational

- [X] T001 [P] `Citation` type and `citations`/`suggestions` fields on `ChatMessage` in types/chat.ts

## Phase 2: User Story 1 - Citations (P1) MVP

- [X] T002 [US1] Handle `citations` event in hooks/use-chat-stream.ts
- [X] T003 [US1] Render `<title> · p.<page>` badges for assistant messages in components/chat/chat-message-bubble.tsx
- [X] T004 [US1] E2E: "asking a grounded question streams an answer with a citation" in tests/e2e/chat.spec.ts

## Phase 3: User Story 2 - Not-found fallback (P1)

- [X] T005 [US2] Verbatim rendering of backend not-found token text (no client logic needed) in components/chat/chat-message-bubble.tsx
- [X] T006 [US2] E2E: "unanswerable question shows the exact fallback message" in tests/e2e/chat.spec.ts

## Phase 4: User Story 3 - Follow-up suggestions (P2)

- [X] T007 [US3] Handle `suggestions` event in hooks/use-chat-stream.ts
- [X] T008 [US3] Render suggestion buttons after streaming ends, wired to `onSuggestionSelect` in components/chat/chat-message-bubble.tsx and app/(protected)/chat/page.tsx
- [X] T009 [US3] E2E: "weak match offers clickable suggestions instead of an answer" in tests/e2e/chat.spec.ts

## Gap summary

None.
