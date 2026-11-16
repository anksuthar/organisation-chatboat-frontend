"use client";

import { Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput({
  onSend,
  disabled,
  initialValue = "",
}: {
  onSend: (question: string) => void;
  disabled?: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  return (
    <div className="flex items-end gap-2 border-t bg-background p-4">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Ask a question about your company documents…"
        rows={1}
        className="max-h-40 min-h-10 flex-1 resize-none"
        disabled={disabled}
      />
      <Button type="button" size="icon" disabled={disabled || !value.trim()} onClick={handleSubmit}>
        <Send className="size-4" />
      </Button>
    </div>
  );
}
