# Implementation Plan: Conversation History & Clear

**Branch**: `005-knowledge-chat` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Files Involved

| File | Role |
|------|------|
| `hooks/use-chat-history.ts` | `CHAT_HISTORY_KEY`, `useChatHistory` (query), `useClearChatHistory` (mutation + invalidate) |
| `services/chat.ts` | `listChatHistory`, `clearChatHistory` via `apiFetch` |
| `services/api-client.ts` | `apiFetch`, `ApiError`, 204 handling |
| `hooks/use-chat-stream.ts` | `loadHistory(entries)`, `clearMessages()` |
| `app/(protected)/chat/page.tsx` | One-time hydration effect, `AlertDialog` confirm, `handleClear`, empty state |
| `components/ui/alert-dialog.tsx` | Base UI dialog (trigger via `render` prop) |
| `tests/e2e/chat.spec.ts` | "clear conversation empties the thread" |

## State & Data Flow

- Server state: React Query `["chat","history"]`.
- UI state: `useChatStream().messages`; seeded from history once via `useEffect` + `hasHydrated` ref.
- `handleClear`: `await clearHistory.mutateAsync()` → `onSuccess` invalidates history → `clearMessages()`.
- Every send invalidates history (01), keeping the cache fresh for the next mount.

## Error / Loading Handling

- Loading: empty-state hidden while `historyLoading`; no skeleton.
- Errors: none surfaced for either GET or DELETE (no `isError` check, no try/catch, no toast).

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| I | PASS | `apiFetch` → `/api/backend/chat/history`. |
| II | PASS | page → hook → service → api-client; mutation invalidates cache. |
| III | PASS (caveat) | `../contracts/chat-history.md`. |
| IV | PASS (partial) | Single test covers hydration (US1 scenario 1) and clear (US2 scenario 1); cancel path and empty-thread disabled state untested. |
| V | PASS | `AlertDialogTrigger render={<Button/>}`. |
| VI | PASS | — |
