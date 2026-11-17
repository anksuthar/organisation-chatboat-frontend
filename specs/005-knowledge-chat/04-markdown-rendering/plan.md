# Implementation Plan: Markdown Rendering & Copy

**Branch**: `005-knowledge-chat` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Files Involved

| File | Role |
|------|------|
| `components/chat/markdown-content.tsx` | `MarkdownContent` (`ReactMarkdown`, `remarkGfm`, `components={{ pre: CodeBlock }}`, `prose` classes); `CodeBlock` copy |
| `components/chat/chat-message-bubble.tsx` | Chooses plain `<p>` (user) vs `MarkdownContent` (assistant); "Copy answer" button |
| `components/ui/button.tsx` | Icon buttons |

No hooks/services — purely presentational.

## State & Data Flow

`message.content` (string, grows during streaming) → `MarkdownContent` re-parses on every render.
Local `copied` state per bubble / code block, reset by `setTimeout(1500)`.

## Error / Loading Handling

- `navigator.clipboard.writeText` rejection not caught.
- No sanitisation beyond react-markdown defaults (raw HTML is escaped/skipped by default).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I | PASS | N/A (no network). |
| II | PASS | Presentational only. |
| III | PASS | N/A. |
| IV | VIOLATION | No Playwright test for Markdown rendering, raw-HTML safety, or copy buttons. |
| V | PASS | `Button` from `components/ui`. |
| VI | PASS | `react-markdown`/`remark-gfm` mandated by constitution security section. |
| Security: markdown without raw HTML | PASS | No `rehype-raw` anywhere in repo. |
