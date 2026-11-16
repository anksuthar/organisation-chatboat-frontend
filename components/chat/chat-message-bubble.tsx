"use client";

import { Check, Copy, FileText, Package, Ticket, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/chat/markdown-content";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

export function ChatMessageBubble({
  message,
  onSuggestionSelect,
}: {
  message: ChatMessage;
  onSuggestionSelect?: (question: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "group relative max-w-[85%] rounded-xl px-4 py-3 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {message.isStreaming && !message.content ? (
          <TypingIndicator />
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownContent content={message.content} />
        )}

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-2">
            {message.citations.map((citation, index) => (
              <Badge key={index} variant="outline" className="gap-1 font-normal">
                <FileText className="size-3" />
                {citation.document_title} · p.{citation.page_number}
              </Badge>
            ))}
          </div>
        )}

        {!isUser && message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
          <div className="mt-3 flex flex-wrap gap-2 border-t pt-2">
            {message.suggestions.map((question, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSuggestionSelect?.(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        )}

        {!isUser && message.orders && message.orders.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-2">
            {message.orders.map((order) => (
              <Badge key={order.id} variant="outline" className="gap-1 font-normal" render={<Link href={`/orders/${order.id}`} />}>
                <Package className="size-3" />
                Order #{order.id} · {order.status} · ${order.total_amount}
              </Badge>
            ))}
          </div>
        )}

        {!isUser && message.products && message.products.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-2">
            {message.products.map((product) => (
              <Badge
                key={product.id}
                variant="outline"
                className="gap-1 font-normal"
                render={<Link href={`/shop/${product.id}`} />}
              >
                {product.name} · ${product.price}
              </Badge>
            ))}
          </div>
        )}

        {!isUser && message.categories && message.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-2">
            {message.categories.map((category) => (
              <Badge key={category} variant="outline" className="font-normal">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {!isUser && message.profile && (
          <div className="mt-3 border-t pt-2">
            <Badge variant="outline" className="gap-1 font-normal" render={<Link href="/profile" />}>
              <UserIcon className="size-3" />
              View full profile
            </Badge>
          </div>
        )}

        {!isUser && message.ticket && (
          <div className="mt-3 border-t pt-2">
            <Badge variant="outline" className="gap-1 font-normal" render={<Link href="/tickets" />}>
              <Ticket className="size-3" />
              {message.ticket.ticket_number} · {message.ticket.status}
            </Badge>
          </div>
        )}

        {!isUser && message.content && !message.isStreaming && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -bottom-3 right-2 size-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleCopy}
            aria-label="Copy answer"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
