# Implementation Plan: Grounding — Citations, Not-Found Fallback, Follow-up Suggestions

**Branch**: `005-knowledge-chat` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Files Involved

| File | Role |
|------|------|
| `hooks/use-chat-stream.ts` | `citations` / `suggestions` event handlers set fields on the assistant message |
| `types/chat.ts` | `Citation`, `ChatMessage.citations`, `ChatMessage.suggestions` |
| `components/chat/chat-message-bubble.tsx` | Citation badges (`FileText` icon); suggestion buttons calling `onSuggestionSelect` |
| `app/(protected)/chat/page.tsx` | Passes `sendMessage` as `onSuggestionSelect` |
| `tests/e2e/chat.spec.ts` | Citation, not-found and suggestions tests |

## State & Data Flow

`citations` / `suggestions` events → `updateMessage(assistantId, m => ({...m, citations|suggestions}))`
→ bubble re-renders. Suggestion click → `sendMessage(question)` → new stream (01).
Not-found is plain `token` text; no special client path.

## Error / Loading Handling

Malformed JSON in these events falls into the generic catch of 01 (partial content kept).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I | PASS | Via proxy. |
| II | PASS | Uses stream hook only. |
| III | PASS (caveat) | `../contracts/chat-stream.md`. |
| IV | PASS | All three stories covered in `tests/e2e/chat.spec.ts`. |
| V | PASS | `Badge`, `Button` from `components/ui`. |
| VI | PASS | — |
