"use client";

import { Button } from "@/components/ui/button";

const SUGGESTED_QUESTIONS = [
  "How many casual leaves do I have?",
  "Can I work from home?",
  "How do I claim travel expenses?",
  "What is the product return period?",
  "Who approves reimbursement?",
];

export function SuggestedQuestions({ onSelect }: { onSelect: (question: string) => void }) {
  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-muted-foreground">Try asking one of these:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTED_QUESTIONS.map((question) => (
          <Button key={question} variant="outline" size="sm" onClick={() => onSelect(question)}>
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
