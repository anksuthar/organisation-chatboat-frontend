"use client";

import { Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { QueryError } from "@/components/shared/query-error";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { useChatHistory, useClearChatHistory } from "@/hooks/use-chat-history";
import { useChatStream } from "@/hooks/use-chat-stream";
import { getErrorMessage } from "@/services/api-client";

export default function ChatPage() {
  // useSearchParams() needs a Suspense boundary for static prerendering in Next 15.
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("prefill") ?? "";
  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorValue,
    refetch: refetchHistory,
  } = useChatHistory();
  const { messages, isStreaming, sendMessage, loadHistory, clearMessages } = useChatStream();
  const clearHistory = useClearChatHistory();
  const hasHydrated = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history && !hasHydrated.current) {
      loadHistory(history);
      hasHydrated.current = true;
    }
  }, [history, loadHistory]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleClear() {
    try {
      await clearHistory.mutateAsync();
      clearMessages();
    } catch (error) {
      // Keep the local thread — the server-side history was not deleted.
      toast.error(`Couldn't clear conversation: ${getErrorMessage(error)}`);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Chat</h1>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="ghost" size="sm" disabled={messages.length === 0} />}>
            <Trash2 className="size-4" />
            Clear conversation
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes your chat history permanently. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>Clear</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {historyError && (
        <QueryError
          error={historyErrorValue}
          onRetry={() => refetchHistory()}
          title="Couldn't load your conversation history"
          className="mx-4 mt-4 w-auto"
        />
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {!historyLoading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">Ask a question about your company documents.</p>
            <SuggestedQuestions onSelect={sendMessage} />
          </div>
        )}

        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} onSuggestionSelect={sendMessage} />
        ))}
      </div>

      <ChatInput onSend={sendMessage} disabled={isStreaming} initialValue={prefill} />
    </div>
  );
}
