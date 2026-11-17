# Contract: Tickets

Sources: `services/tickets.ts`, `types/ticket.ts`, `hooks/use-tickets.ts`, `services/api-client.ts`. No Playwright mocks exist for this resource.

## Shared shape (`types/ticket.ts`)

```ts
type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

interface Ticket {
  id: number;
  ticket_number: string;
  order_id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  created_at: string; // ISO 8601, parsed with new Date()
}
```

## GET /api/backend/tickets

Proxied to `${BACKEND_URL}/api/v1/tickets`.

- **Request**: no body, no query params (no pagination/filtering in frontend).
- **Response 200**: `Ticket[]`, rendered in array order.
- **Scope per role** (own tickets vs all): UNVERIFIED (not visible in frontend code).
- **Errors**: non-2xx → `ApiError(status, detail ?? statusText)`; not surfaced in UI.

## GET /api/backend/tickets/{id}

- **Path param**: `id` = `Number(params.id)` (non-numeric route segment becomes `NaN` → `tickets/NaN`).
- **Response 200**: `Ticket`.
- **Errors**: 404/403 etc. → `ApiError`; UI keeps showing a skeleton. Status codes returned: UNVERIFIED (not visible in frontend code).

## Not used / not present

- No create, update, delete, or comment endpoints are called. Tickets are created server-side by the chat agent (see `specs/005-knowledge-chat/contracts/chat-stream.md`, `ticket` event).
