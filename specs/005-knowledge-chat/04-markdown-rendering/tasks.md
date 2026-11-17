# Tasks: Markdown Rendering & Copy

**Input**: `specs/005-knowledge-chat/04-markdown-rendering/`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: User Story 1 - Formatted, safe answers (P1) MVP

- [X] T001 [US1] `MarkdownContent` with `react-markdown` + `remark-gfm`, no raw HTML, `prose` styling in components/chat/markdown-content.tsx
- [X] T002 [US1] Assistant → Markdown, user → plain `whitespace-pre-wrap` text in components/chat/chat-message-bubble.tsx
- [ ] T003 [US1] GAP: E2E test asserting Markdown elements render and raw HTML is not injected in tests/e2e/chat.spec.ts

## Phase 2: User Story 2 - Copy (P3)

- [X] T004 [P] [US2] "Copy answer" button for finished assistant messages with 1.5 s check icon in components/chat/chat-message-bubble.tsx
- [X] T005 [P] [US2] `CodeBlock` with "Copy code" button in components/chat/markdown-content.tsx
- [X] T006 [US2] GAP: `CodeBlock` copies `String(children)`, which is `[object Object]` when react-markdown passes a `<code>` element — extract text content instead (verify in browser) in components/chat/markdown-content.tsx — FIXED (2026-11-16): `CodeBlock` copies `extractText(children)`, which recursively collects strings/numbers from arrays and elements' `props.children` (react-markdown passes `pre` a `<code>` element); browser check still pending
- [ ] T007 [US2] GAP: E2E test for "Copy answer" / "Copy code" clipboard contents in tests/e2e/chat.spec.ts

## Gap summary

- T003: Markdown/raw-HTML safety untested (Constitution IV).
- T006: FIXED (2026-11-16) — recursive text extraction from children (browser/E2E verification still pending, see T007).
- T007: copy story untested (Constitution IV).
