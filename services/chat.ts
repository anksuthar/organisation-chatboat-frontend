import { apiFetch } from "@/services/api-client";
import type { ChatHistoryEntry } from "@/types/chat";

export function listChatHistory(): Promise<ChatHistoryEntry[]> {
  return apiFetch("chat/history");
}

export function clearChatHistory(): Promise<void> {
  return apiFetch("chat/history", { method: "DELETE" });
}

/** Raw streaming call — bypasses apiFetch since the caller needs the
 * unparsed Response body to read the SSE stream itself. */
export function postChatQuestion(question: string): Promise<Response> {
  return fetch("/api/backend/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
}
