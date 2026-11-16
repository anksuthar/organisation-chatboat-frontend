"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clearChatHistory, listChatHistory } from "@/services/chat";

export const CHAT_HISTORY_KEY = ["chat", "history"] as const;

export function useChatHistory() {
  return useQuery({ queryKey: CHAT_HISTORY_KEY, queryFn: listChatHistory });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearChatHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAT_HISTORY_KEY }),
  });
}
