# Feature Specification: Streaming Answers

**Feature Branch**: `005-knowledge-chat`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - Ask a question and watch the answer stream in (Priority: P1)

A signed-in user types a question on `/chat` and sends it with Enter or the send button. Their
question appears immediately as a right-aligned bubble; an assistant bubble shows a three-dot
typing indicator until the first token arrives, then grows token by token.

**Why this priority**: The core value of the product.

**Independent Test**: Mock `POST /api/backend/chat` with two `token` events and `done`; the concatenated text appears.

**Acceptance Scenarios**:

1. **Given** an empty thread, **When** the user types "How many casual leaves do I have?" and clicks send, **Then** the user bubble shows the question and the assistant bubble shows "You have 12 casual leaves." once tokens "You have " and "12 casual leaves." stream in.
2. **Given** text in the input, **When** the user presses Enter (without Shift), **Then** the question is sent and the input is cleared.
3. **Given** text in the input, **When** the user presses Shift+Enter, **Then** a newline is inserted and nothing is sent.
4. **Given** an answer is streaming, **When** the user looks at the input, **Then** the textarea and send button are disabled until the stream ends.
5. **Given** the assistant bubble has no content yet and is streaming, **Then** a typing indicator is shown instead of text.

---

### User Story 2 - Start from a starter question (Priority: P3)

On an empty thread (and after history has loaded) the page shows "Ask a question about your
company documents." and "Try asking one of these:" with five static chips. Clicking a chip sends
that question immediately.

**Why this priority**: Onboarding aid; chat works without it.

**Independent Test**: Load `/chat` with empty history, click "Can I work from home?", assert the POST body `question`.

**Acceptance Scenarios**:

1. **Given** history is empty, **When** the page loads, **Then** chips "How many casual leaves do I have?", "Can I work from home?", "How do I claim travel expenses?", "What is the product return period?", "Who approves reimbursement?" are shown.
2. **Given** the chips are visible, **When** the user clicks one, **Then** it is sent as the question and the empty state disappears.

---

### User Story 3 - Recover from a failed request (Priority: P2)

If the chat request fails (non-2xx, no body, network error, malformed event JSON), the assistant
bubble shows a friendly error rather than hanging.

**Why this priority**: Prevents a stuck UI on backend outages.

**Independent Test**: Mock `POST /api/backend/chat` with status 500; assert the fallback message.

**Acceptance Scenarios**:

1. **Given** the backend returns 500, **When** the user sends a question, **Then** the assistant bubble shows "Something went wrong reaching the chat service. Please try again." and the input is re-enabled.
2. **Given** some tokens already streamed, **When** the stream errors, **Then** the partial content is kept (no error text appended) and the message stops streaming.

---

### Edge Cases

- Whitespace-only input: send button disabled; `ChatInput` and `sendMessage` both ignore it. The question is sent trimmed.
- Stream closes without a `done` event: global `isStreaming` resets (input re-enabled) but the message keeps `isStreaming: true`, so the copy button and follow-up suggestions never appear, and an empty message keeps showing the typing indicator. [Observed behaviour — see GAP in tasks.]
- Unknown event names and blocks with no `data:` line are ignored.
- Navigating away mid-stream: no `AbortController`; the fetch is not cancelled and in-memory messages are lost (persisted history reloads on return).
- The thread auto-scrolls smoothly to the bottom on every message change.
- `?prefill=<text>` pre-populates the input (not auto-sent) — see [05-agent-actions](../05-agent-actions/spec.md).

## Requirements

### Functional Requirements

- **FR-001**: System MUST POST `{ question }` (trimmed) to `/api/backend/chat` and read the response body as a stream.
- **FR-002**: System MUST split the stream on `\n\n`, parse `event:`/`data:` lines, and handle events incrementally while buffering incomplete blocks.
- **FR-003**: System MUST append `token.text` to the current assistant message as each event arrives.
- **FR-004**: System MUST mark the assistant message as finished on `done`.
- **FR-005**: System MUST disable the input and send button while a request is in flight.
- **FR-006**: System MUST show `Something went wrong reaching the chat service. Please try again.` on failure when no content has streamed.
- **FR-007**: System MUST invalidate the `["chat","history"]` query after each send, success or failure.
- **FR-008**: Enter sends; Shift+Enter inserts a newline.
- **FR-009**: Empty thread MUST show five static starter questions that send on click.

### Key Entities

- **ChatMessage** (client-only): `id` (UUID), `role` (`user`|`assistant`), `content`, optional `citations`, `suggestions`, `orders`, `products`, `categories`, `profile`, `ticket`, `isStreaming`.

## Success Criteria

- **SC-001**: Tokens render incrementally (proxy streams; test asserts concatenated text).
- **SC-002**: A failed request never leaves the input permanently disabled.
