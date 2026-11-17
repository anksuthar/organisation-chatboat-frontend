# Feature Specification: Grounding — Citations, Not-Found Fallback, Follow-up Suggestions

**Feature Branch**: `005-knowledge-chat`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - See which documents an answer came from (Priority: P1)

When the backend sends a `citations` event, the assistant bubble shows one outline badge per
citation with a file icon and the text `<document_title> · p.<page_number>`, below the answer.

**Why this priority**: Trust in RAG answers depends on verifiable sources.

**Independent Test**: Mock a stream containing `citations: [{document_id:1, document_title:"Leave Policy", page_number:3}]`.

**Acceptance Scenarios**:

1. **Given** a stream with tokens and a citations event for "Leave Policy" page 3, **When** it completes, **Then** "Leave Policy · p.3" is visible under the answer.
2. **Given** a stream with no citations event, **Then** no citation row is rendered.

---

### User Story 2 - Clear "not found" answer (Priority: P1)

When the documents do not contain the answer, the backend streams a fixed sentence which the UI
renders verbatim; there is no client-side detection of this case.

**Why this priority**: Prevents hallucinated answers being mistaken for policy.

**Independent Test**: Mock a single token "I couldn't find this information in the uploaded documents." + `done`.

**Acceptance Scenarios**:

1. **Given** an unanswerable question, **When** the stream completes, **Then** "I couldn't find this information in the uploaded documents." is shown exactly and no citations appear.

---

### User Story 3 - Follow a related-question suggestion (Priority: P2)

On a weak match the backend sends a short reply plus a `suggestions` event. After the stream
finishes, each suggestion is rendered as an outline button; clicking it sends that text as a new
question.

**Why this priority**: Recovers partial-match queries without retyping.

**Independent Test**: Mock "is saturday working" → suggestions; click the first; assert second POST question and answer.

**Acceptance Scenarios**:

1. **Given** a stream with `suggestions: ["What are the standard working days and hours?", "Can I work overtime?"]`, **When** `done` arrives, **Then** both are shown as buttons.
2. **Given** suggestion buttons, **When** the user clicks "What are the standard working days and hours?", **Then** a new POST is sent with that exact question and its answer "Monday to Friday, 9am-6pm." with citation "Timing Policy · p.1" is shown.

---

### Edge Cases

- Suggestions are hidden while the message is still streaming (`!message.isStreaming`); citations are shown as soon as the event arrives.
- A later `citations`/`suggestions` event replaces (not merges) earlier ones.
- Citation badges are not links; `document_id` is unused by the UI.
- Citations and suggestions are not persisted in history; after reload only question/answer text is restored.
- Duplicate citations are rendered as-is (keyed by index).

## Requirements

### Functional Requirements

- **FR-001**: System MUST render each citation as `<document_title> · p.<page_number>`.
- **FR-002**: System MUST render the backend's not-found text verbatim (no client rewriting).
- **FR-003**: System MUST render suggestions as buttons only after the message has finished streaming.
- **FR-004**: Clicking a suggestion MUST call the same `sendMessage` path as typed input.
- **FR-005**: Citation/suggestion UI MUST be shown only on assistant messages.

### Key Entities

- **Citation**: `document_id`, `document_title`, `page_number`.
- **Suggestion**: plain string question.

## Success Criteria

- **SC-001**: 100% of citations in the event are visible.
- **SC-002**: Not-found sentence matches the backend string exactly.
