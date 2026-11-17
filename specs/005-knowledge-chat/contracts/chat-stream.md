# Contract: Ask a question (SSE stream)

Sources: `services/chat.ts#postChatQuestion`, `hooks/use-chat-stream.ts`, `types/chat.ts`, `tests/e2e/chat.spec.ts`.

## Request

- **Method / path (browser)**: `POST /api/backend/chat` → proxied to `${BACKEND_URL}/api/v1/chat`
- **Headers**: `Content-Type: application/json` (proxy adds `Authorization: Bearer <session>`)
- **Body**:

```json
{ "question": "string (trimmed, non-empty)" }
```

## Response

- **Status**: `200`, `Content-Type: text/event-stream` (as mocked in tests; header not checked by the client)
- **Framing**: blocks separated by a blank line (`\n\n`); each block has `event: <name>` and one or more `data: <json>` lines (multiple `data:` lines are joined with `\n`). Blocks with no `data:` line are ignored. Missing `event:` defaults to `message` (ignored).

| Event | `data` JSON | Client effect |
|-------|-------------|---------------|
| `token` | `{ "text": string }` | Appended to the assistant message content |
| `citations` | `{ "citations": Citation[] }` | Replaces message citations |
| `suggestions` | `{ "suggestions": string[] }` | Replaces message follow-up suggestions |
| `orders` | `{ "orders": ChatOrderSummary[] }` | Order badges |
| `products` | `{ "products": ChatProductSummary[] }` | Product badges |
| `categories` | `{ "categories": string[] }` | Category badges |
| `profile` | `ChatProfileSummary` (top-level object, not wrapped) | "View full profile" badge |
| `ticket` | `ChatTicketSummary` (top-level object, not wrapped) | Ticket badge + invalidates `["tickets"]` |
| `done` | `{}` (any) | Marks message `isStreaming: false` |
| other | — | Ignored |

### Shapes (`types/chat.ts`)

```ts
Citation            { document_id: number; document_title: string; page_number: number }
ChatOrderSummary    { id: number; status: string; total_amount: string; created_at: string }
ChatProductSummary  { id: number; name: string; price: string; sku: string }
ChatProfileSummary  { name: string; email: string; phone: string|null; address_line1: string|null;
                      address_line2: string|null; city: string|null; postal_code: string|null; country: string|null }
ChatTicketSummary   { ticket_number: string; order_id: number; status: string }
```

Not-found answer (as mocked): a single `token` with text `I couldn't find this information in the uploaded documents.` followed by `done`.

## Errors handled

- Any non-2xx status, or missing body → treated as failure. No status-specific handling (401/403/422/5xx all equivalent).
- Network failure / malformed JSON in a `data:` line → same catch path.
- Failure effect: assistant message keeps any partial content, else shows `Something went wrong reaching the chat service. Please try again.`
- Error body shape: UNVERIFIED (not visible in frontend code; not read).
- Mid-stream `error` event: UNVERIFIED (not visible in frontend code; would be ignored).
