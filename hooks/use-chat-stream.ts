"use client";

import { useCallback, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { CHAT_HISTORY_KEY } from "@/hooks/use-chat-history";
import { postChatQuestion } from "@/services/chat";
import type {
  ChatHistoryEntry,
  ChatMessage,
  ChatOrderSummary,
  ChatProductSummary,
  ChatProfileSummary,
  ChatTicketSummary,
  Citation,
} from "@/types/chat";

/** Backend frames each SSE message as `event: <name>\ndata: <json>\n\n`
 * (see app/api/v1/chat.py). Splits the raw byte stream on blank lines and
 * parses each block into {event, data}. */
function parseSseBlock(block: string): { event: string; data: string } | null {
  let event = "message";
  const dataLines: string[] = [];

  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  return dataLines.length > 0 ? { event, data: dataLines.join("\n") } : null;
}

export function useChatStream() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const updateMessage = useCallback((id: string, updater: (message: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((message) => (message.id === id ? updater(message) : message)));
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const assistantId = crypto.randomUUID();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        const response = await postChatQuestion(trimmed);
        if (!response.ok || !response.body) {
          throw new Error("Failed to reach the chat service");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let separatorIndex = buffer.indexOf("\n\n");
          while (separatorIndex !== -1) {
            const block = buffer.slice(0, separatorIndex);
            buffer = buffer.slice(separatorIndex + 2);

            const parsed = parseSseBlock(block);
            if (parsed) {
              if (parsed.event === "token") {
                const { text } = JSON.parse(parsed.data) as { text: string };
                updateMessage(assistantId, (message) => ({ ...message, content: message.content + text }));
              } else if (parsed.event === "citations") {
                const { citations } = JSON.parse(parsed.data) as { citations: Citation[] };
                updateMessage(assistantId, (message) => ({ ...message, citations }));
              } else if (parsed.event === "suggestions") {
                const { suggestions } = JSON.parse(parsed.data) as { suggestions: string[] };
                updateMessage(assistantId, (message) => ({ ...message, suggestions }));
              } else if (parsed.event === "orders") {
                const { orders } = JSON.parse(parsed.data) as { orders: ChatOrderSummary[] };
                updateMessage(assistantId, (message) => ({ ...message, orders }));
              } else if (parsed.event === "products") {
                const { products } = JSON.parse(parsed.data) as { products: ChatProductSummary[] };
                updateMessage(assistantId, (message) => ({ ...message, products }));
              } else if (parsed.event === "categories") {
                const { categories } = JSON.parse(parsed.data) as { categories: string[] };
                updateMessage(assistantId, (message) => ({ ...message, categories }));
              } else if (parsed.event === "profile") {
                const profile = JSON.parse(parsed.data) as ChatProfileSummary;
                updateMessage(assistantId, (message) => ({ ...message, profile }));
              } else if (parsed.event === "ticket") {
                const ticket = JSON.parse(parsed.data) as ChatTicketSummary;
                updateMessage(assistantId, (message) => ({ ...message, ticket }));
                queryClient.invalidateQueries({ queryKey: ["tickets"] });
              } else if (parsed.event === "done") {
                updateMessage(assistantId, (message) => ({ ...message, isStreaming: false }));
              }
            }

            separatorIndex = buffer.indexOf("\n\n");
          }
        }
      } catch {
        updateMessage(assistantId, (message) => ({
          ...message,
          content: message.content || "Something went wrong reaching the chat service. Please try again.",
          isStreaming: false,
        }));
      } finally {
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: CHAT_HISTORY_KEY });
      }
    },
    [queryClient, updateMessage]
  );

  const loadHistory = useCallback((entries: ChatHistoryEntry[]) => {
    setMessages(
      entries.flatMap((entry) => [
        { id: `${entry.id}-question`, role: "user" as const, content: entry.question },
        { id: `${entry.id}-answer`, role: "assistant" as const, content: entry.answer },
      ])
    );
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isStreaming, sendMessage, loadHistory, clearMessages };
}
