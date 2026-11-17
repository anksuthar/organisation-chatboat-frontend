# Implementation Plan: Knowledge Chat

**Branch**: `005-knowledge-chat` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-knowledge-chat/spec.md` (retro-documented; code already exists)

## Summary

`/chat` is a client page combining two data paths: a React Query history query/mutation
(`hooks/use-chat-history.ts`) and a hand-rolled SSE reader (`hooks/use-chat-stream.ts`) that POSTs
the question through the BFF proxy and incrementally applies `token`, `citations`, `suggestions`,
`orders`, `products`, `categories`, `profile`, `ticket` and `done` events to local message state.

## Technical Context

**Language/Version**: TypeScript (strict), React 19.1, Next.js 15.5 App Router

**Primary Dependencies**: `@tanstack/react-query` v5, `react-markdown` v10 + `remark-gfm` v4, `framer-motion` v12 (bubble/typing animation), `lucide-react`, shadcn/Base UI (`AlertDialog`, `Button`, `Badge`, `Textarea`)

**Storage**: None client-side; conversation state is in-memory `useState`, persisted history lives in the backend

**Testing**: Playwright `tests/e2e/chat.spec.ts` (SSE bodies mocked via `route.fulfill` with `text/event-stream`)

**Target Platform**: Modern browsers (uses `ReadableStream.getReader`, `TextDecoder`, `crypto.randomUUID`, `navigator.clipboard`)

**Project Type**: Web frontend (BFF pattern)

**Constraints**: Proxy must not buffer SSE; JWT never in client JS

## Architecture & Data Flow

```text
app/(protected)/chat/page.tsx  ("use client")
 ├─ useChatHistory()  ── services/chat.listChatHistory ── apiFetch("chat/history") ── GET /api/backend/chat/history
 ├─ useClearChatHistory() ── services/chat.clearChatHistory ── apiFetch DELETE ── DELETE /api/backend/chat/history
 └─ useChatStream()
      sendMessage(q) ── services/chat.postChatQuestion(q) ── fetch POST /api/backend/chat  (raw Response, SSE)
         reader loop: split on "\n\n" → parseSseBlock → event switch → updateMessage(assistantId)
         finally: invalidate ["chat","history"]; on `ticket` event also invalidate ["tickets"]

/api/backend/[...path]/route.ts  → ${BACKEND_URL}/api/v1/<path>, adds Authorization: Bearer <session cookie>,
                                   passes request.body / backendResponse.body through as streams
```

UI composition: `ChatInput` (textarea + send), `ChatMessageBubble` (per message; uses
`MarkdownContent`, `TypingIndicator`, citation/suggestion/result badges), `SuggestedQuestions`
(static starter chips on empty thread).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I. BFF Security Boundary | PASS | All calls hit `/api/backend/*`; proxy streams body unbuffered (`route.ts` returns `backendResponse.body`). No token handling in client code. |
| II. Layered Data Access | PASS (noted exception) | Streaming isolated in `hooks/use-chat-stream.ts` as the constitution allows. `services/chat.ts#postChatQuestion` calls `fetch("/api/backend/chat")` directly instead of `api-client` because the raw `Response` body is needed — still inside the service layer and through the proxy. History mutation invalidates `["chat","history"]`. No forms (chat input is not react-hook-form; single free-text field). |
| III. Contract-First | PASS (caveat) | `contracts/chat-stream.md`, `contracts/chat-history.md` written from frontend code + Playwright mocks only; not cross-checked against backend OpenAPI in this pass. |
| IV. Test Every User Story | VIOLATION | 01/02/03 core stories tested; no tests for starter chips, prefill, network-error fallback, markdown/copy, or any agent result event (orders/products/categories/profile/ticket). See sub-spec gaps. |
| V. Pinned Stack & Base UI | PASS | Next 15.5.20; `render` prop used (`AlertDialogTrigger`, `Badge render={<Link/>}`); no `asChild`. |
| VI. Simplicity | PASS | No global store; state local to hook. `framer-motion` is an extra dependency used only for animation (no Complexity Tracking entry found). |
| Security: markdown without raw HTML | PASS | `MarkdownContent` uses `react-markdown` + `remark-gfm`, no `rehype-raw`. |

## Project Structure

### Documentation

```text
specs/005-knowledge-chat/
├── spec.md
├── plan.md
├── contracts/
│   ├── chat-stream.md
│   └── chat-history.md
├── 01-streaming-answers/{spec,plan,tasks}.md
├── 02-grounding-citations-fallback/{spec,plan,tasks}.md
├── 03-conversation-history/{spec,plan,tasks}.md
├── 04-markdown-rendering/{spec,plan,tasks}.md
└── 05-agent-actions/{spec,plan,tasks}.md
```

### Source Code

```text
app/(protected)/chat/page.tsx
app/api/backend/[...path]/route.ts          # shared proxy
hooks/use-chat-stream.ts
hooks/use-chat-history.ts
services/chat.ts
services/api-client.ts                       # shared
types/chat.ts
components/chat/chat-input.tsx
components/chat/chat-message-bubble.tsx
components/chat/markdown-content.tsx
components/chat/suggested-questions.tsx
components/chat/typing-indicator.tsx
components/orders/order-detail.tsx           # "Report a problem" → /chat?prefill=
lib/roles.ts                                 # roleHomePath → /chat for non-admins
components/layout/app-sidebar.tsx            # Chat nav item
tests/e2e/chat.spec.ts
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `postChatQuestion` bypasses `apiFetch` | Caller needs unparsed `Response.body` stream | `apiFetch` always `response.json()`s the body |
