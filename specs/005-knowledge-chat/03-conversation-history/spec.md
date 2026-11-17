# Feature Specification: Conversation History & Clear

**Feature Branch**: `005-knowledge-chat`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - Resume a previous conversation (Priority: P1)

On opening `/chat`, the user's saved question/answer pairs are fetched and shown as alternating
user/assistant bubbles, so the thread survives reloads and navigation.

**Why this priority**: Users expect context to persist.

**Independent Test**: Mock `GET /api/backend/chat/history` with one entry; assert the question bubble renders.

**Acceptance Scenarios**:

1. **Given** history `[{id:1, question:"Can I work from home?", answer:"Yes, up to 2 days/week."}]`, **When** the page loads, **Then** a user bubble "Can I work from home?" and an assistant bubble "Yes, up to 2 days/week." are shown.
2. **Given** history is still loading, **Then** neither the empty-state prompt nor messages are shown.
3. **Given** history is empty, **When** loading finishes, **Then** the empty-state prompt and starter chips are shown.

---

### User Story 2 - Clear the conversation (Priority: P2)

The header has a "Clear conversation" button (disabled when the thread is empty). It opens a
confirmation dialog "Clear conversation?" — "This deletes your chat history permanently. This
cannot be undone." with Cancel / Clear. Clear deletes server history, then empties the thread.

**Why this priority**: Privacy / fresh start; not needed to ask questions.

**Independent Test**: Mock GET with one entry and DELETE → 204; click through the dialog; assert thread empty.

**Acceptance Scenarios**:

1. **Given** a hydrated thread, **When** the user clicks "Clear conversation" then "Clear", **Then** `DELETE /api/backend/chat/history` is sent, the bubbles disappear, and "Ask a question about your company documents." is shown.
2. **Given** the dialog is open, **When** the user clicks "Cancel", **Then** nothing is deleted.
3. **Given** an empty thread, **Then** "Clear conversation" is disabled.

---

### Edge Cases

- Hydration happens once per page mount (`hasHydrated` ref). Later refetches (after each send) do not overwrite in-memory messages.
- Restored messages contain only text — citations, suggestions and agent result badges from the original session are not restored.
- History fetch error: `isLoading` becomes false with no data, so the page shows the empty-state prompt as if there were no history; no error is surfaced. [Observed — GAP]
- Clear failure: `mutateAsync` rejects inside `handleClear`; the rejection is unhandled, no message is shown, and the thread is not cleared. [Observed — GAP]
- Clear is local-first only after server success: messages are cleared only after the DELETE resolves.
- React Query defaults: `staleTime` 30 s, `retry` 1 (`app/providers.tsx`).

## Requirements

### Functional Requirements

- **FR-001**: System MUST fetch `GET /api/backend/chat/history` via React Query key `["chat","history"]`.
- **FR-002**: System MUST map each entry to a user message (`<id>-question`) and assistant message (`<id>-answer`), in array order.
- **FR-003**: System MUST hydrate only once per mount.
- **FR-004**: System MUST require confirmation before clearing.
- **FR-005**: On confirmed clear, System MUST call `DELETE /api/backend/chat/history`, invalidate `["chat","history"]`, then empty local messages.
- **FR-006**: "Clear conversation" MUST be disabled when there are no messages.

### Key Entities

- **ChatHistoryEntry**: `id`, `question`, `answer`, `created_at` (unused in UI).

## Success Criteria

- **SC-001**: Reload restores all returned entries in order.
- **SC-002**: After clear, the thread is empty and the starter prompt shows.
