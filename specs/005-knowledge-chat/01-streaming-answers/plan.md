# Implementation Plan: Streaming Answers

**Branch**: `005-knowledge-chat` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Files Involved

| File | Role |
|------|------|
| `app/(protected)/chat/page.tsx` | Wires `useChatStream`, renders bubbles, empty state, auto-scroll, `ChatInput` |
| `hooks/use-chat-stream.ts` | `parseSseBlock`, `sendMessage` reader loop, `updateMessage`, `isStreaming` |
| `services/chat.ts` | `postChatQuestion` — raw `fetch` POST to `/api/backend/chat` |
| `types/chat.ts` | `ChatMessage` and event payload types |
| `components/chat/chat-input.tsx` | Textarea; Enter/Shift+Enter; disabled while streaming; `initialValue` |
| `components/chat/chat-message-bubble.tsx` | User vs assistant bubble, typing indicator switch |
| `components/chat/typing-indicator.tsx` | Animated three dots (framer-motion) |
| `components/chat/suggested-questions.tsx` | Static `SUGGESTED_QUESTIONS` chips |
| `app/api/backend/[...path]/route.ts` | Unbuffered request/response passthrough |
| `tests/e2e/chat.spec.ts` | `sseFulfill` helper; streaming test |

## State & Data Flow

1. `sendMessage(q)` trims, returns if empty, appends `{user}` and `{assistant, content:"", isStreaming:true}` with `crypto.randomUUID()` ids, sets `isStreaming=true`.
2. `postChatQuestion` → `Response`; throws if `!ok || !body`.
3. `reader.read()` loop decodes with `TextDecoder({stream:true})`, accumulates `buffer`, slices complete blocks at each `\n\n`, dispatches by `event`.
4. `catch` → keep partial content or set fallback text; `isStreaming:false` on the message.
5. `finally` → `setIsStreaming(false)`; invalidate `["chat","history"]`.

State is local `useState` in the hook (no React Query for the stream — permitted exception).

## Error / Loading Handling

- Loading: typing indicator while message empty; input disabled.
- Error: single generic message; no toast; no status-specific handling (e.g. 401 does not redirect to login).
- No abort/cancel; no retry button.

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I | PASS | Same-origin `/api/backend/chat`; proxy streams body. |
| II | PASS (noted) | Stream isolated in dedicated hook; service uses raw `fetch` (justified in parent Complexity Tracking). |
| III | PASS (caveat) | See `../contracts/chat-stream.md`. |
| IV | VIOLATION | US1 tested; US2 (starter chips) and US3 (error fallback) have no Playwright test. |
| V | PASS | Base UI `Button`/`Textarea`. |
| VI | PASS | — |
