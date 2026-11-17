# Feature Specification: Markdown Rendering & Copy

**Feature Branch**: `005-knowledge-chat`

**Created**: 2026-11-16

**Status**: Implemented (retro-documented)

**Parent**: [../spec.md](../spec.md)

## User Scenarios & Testing

### User Story 1 - Read formatted answers safely (Priority: P1)

Assistant answers are rendered as GitHub-flavoured Markdown (headings, lists, tables, bold, inline
and fenced code) with Tailwind Typography styling; raw HTML in the answer is not rendered as HTML.
User messages are shown as plain text with preserved whitespace.

**Why this priority**: LLM answers are Markdown; rendering safely is a constitution requirement.

**Independent Test**: Mock a token containing `**bold**`, a list, and `<script>`; assert `<strong>` and list items render and no script element is created.

**Acceptance Scenarios**:

1. **Given** an answer containing `**Leave**` and `- item`, **When** rendered, **Then** "Leave" is bold and "item" is a list item.
2. **Given** an answer containing raw HTML, **When** rendered, **Then** it is not injected as DOM HTML.
3. **Given** a user message with line breaks, **Then** they are preserved (`whitespace-pre-wrap`), no Markdown parsing.
4. **Given** content is still streaming, **Then** Markdown re-renders with each token.

---

### User Story 2 - Copy an answer or code block (Priority: P3)

Hovering a finished assistant bubble reveals a "Copy answer" icon button; fenced code blocks show
a "Copy code" button. Clicking copies to the clipboard and swaps the icon to a check for 1.5 s.

**Why this priority**: Convenience.

**Independent Test**: Grant clipboard permission, click "Copy answer", read clipboard.

**Acceptance Scenarios**:

1. **Given** a finished assistant answer, **When** the user clicks "Copy answer", **Then** the raw Markdown content is written to the clipboard and a check icon shows for 1.5 s.
2. **Given** a fenced code block, **When** the user clicks "Copy code", **Then** the block text (trailing newline stripped) is copied.
3. **Given** a message still streaming or empty, **Then** no "Copy answer" button is rendered.

---

### Edge Cases

- `CodeBlock` stringifies `children`; when children are React elements (react-markdown passes a `<code>` element to `pre`), `String(children)` yields `[object Object]`, so "Copy code" likely copies `[object Object]` rather than the code text. [NEEDS CLARIFICATION: confirm in browser; looks like a defect]
- Clipboard failure (insecure context / denied permission): the promise rejects unhandled; no feedback.
- Copy buttons are hover-revealed (`opacity-0 group-hover:opacity-100`) — not visible on touch devices without hover, but still focusable/clickable.

## Requirements

### Functional Requirements

- **FR-001**: Assistant content MUST be rendered with `react-markdown` + `remark-gfm` and MUST NOT enable raw HTML (no `rehype-raw`).
- **FR-002**: User content MUST be rendered as plain text.
- **FR-003**: Fenced code blocks MUST render in a scrollable `<pre>` with a "Copy code" button.
- **FR-004**: Finished, non-empty assistant messages MUST expose a "Copy answer" button copying `message.content`.
- **FR-005**: Copy buttons MUST show a check icon for 1.5 s after copying.

## Success Criteria

- **SC-001**: No raw HTML from model output reaches the DOM.
- **SC-002**: Copied answer text equals the streamed Markdown source.
