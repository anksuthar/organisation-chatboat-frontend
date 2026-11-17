# Feature Specification: Knowledge Chat

**Feature Branch**: `005-knowledge-chat`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented from existing code)

**Input**: Document the existing RAG chat screen at `/chat`: streamed answers over SSE, citations, "not found" fallback, conversation history and clearing, markdown rendering, and the agent's structured order/product/profile/ticket results.

## Purpose

A single chat screen where any signed-in user asks a natural-language question and receives an
answer streamed token-by-token from the backend's RAG/agent pipeline. Answers grounded in uploaded
company documents carry page-level citations; questions the documents cannot answer get a fixed
fallback (or follow-up suggestions). For customers, the same chat also surfaces structured results
(orders, products, product categories, profile, newly opened support tickets) as links into the
dedicated pages.

## Actors / Roles

| Role | Access | Notes |
|------|--------|-------|
| `employee` | `/chat` is the role home (`lib/roles.ts`) and first sidebar item | Internal document Q&A |
| `customer` | `/chat` is the role home and first sidebar item | Same chat; agent may also return order/product/profile/ticket events |
| `admin` | Can open `/chat` (middleware only restricts `/admin/**`); sidebar shows it under "General" | Role home is `/admin` |

The frontend does not vary chat behaviour by role; which SSE events are emitted is decided by the
backend (FastAPI is the authorization authority).

## Sub-specifications

| # | Sub-spec | Summary |
|---|----------|---------|
| 01 | [Streaming answers](01-streaming-answers/spec.md) | Ask a question (typed, starter chip, or `?prefill=`), stream the answer over SSE with a typing indicator, generic error fallback |
| 02 | [Grounding: citations, not-found fallback, follow-up suggestions](02-grounding-citations-fallback/spec.md) | Citation badges per answer, verbatim "not found" text, clickable related-question suggestions |
| 03 | [Conversation history & clear](03-conversation-history/spec.md) | Hydrate the thread from saved history on load; confirm-and-clear the whole conversation |
| 04 | [Markdown rendering & copy](04-markdown-rendering/spec.md) | Assistant answers rendered with react-markdown + GFM (no raw HTML); copy answer / copy code block |
| 05 | [Agent result cards (commerce, profile, tickets)](05-agent-actions/spec.md) | Order/product/category/profile/ticket SSE events rendered as badges linking to `/orders/:id`, `/shop/:id`, `/profile`, `/tickets`; "Report a problem" prefill from order detail |

Commerce pages themselves (shop, cart, orders, profile) are specified in `specs/006-commerce/`;
ticket pages in `specs/007-support-tickets/`.

## Cross-cutting Requirements

- **CR-001**: All chat traffic MUST go through the BFF proxy (`/api/backend/chat`, `/api/backend/chat/history`); the browser never sees the JWT or `BACKEND_URL`.
- **CR-002**: The SSE response MUST be streamed unbuffered by the proxy so tokens render as they arrive.
- **CR-003**: Model-generated text MUST be rendered through `react-markdown` without raw HTML; user text is rendered as plain text.
- **CR-004**: Only one question can be in flight at a time (input and send button disabled while streaming).
- **CR-005**: After every send (success or failure) the chat-history query is invalidated.

## Success Criteria

- **SC-001**: First answer tokens appear in the UI before the stream completes (incremental rendering, not buffered).
- **SC-002**: Every citation in a `citations` event is visible as `<document title> · p.<page>`.
- **SC-003**: The not-found answer is shown verbatim: "I couldn't find this information in the uploaded documents."
- **SC-004**: Reloading `/chat` restores prior question/answer pairs; clearing leaves an empty thread with the starter prompt.
- **SC-005**: Every user story across sub-specs has at least one Playwright test with mocked `/api/backend/*` (currently NOT met — see sub-spec gap summaries).

## Assumptions

- Backend SSE framing is `event: <name>\ndata: <json>\n\n` (hook comment references backend `app/api/v1/chat.py`; not verified here).
- History entries carry only question/answer text (no citations or structured payloads), so these are not restored on reload.
