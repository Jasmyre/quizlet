// Depends on the shared question shell and shadcn Input primitive for free-text answers.
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TestAnswer, TestFeedback, TestQuestion } from "../../_lib/types";
import { QuestionShell } from "../question-shell";

interface WrittenQuestionProps {
  feedback: TestFeedback | null;
  isDisabled: boolean;
  onChange: (value: TestAnswer) => void;
  question: Extract<TestQuestion, { type: "written" }>;
  value: TestAnswer | undefined;
}

export function WrittenQuestion({
  feedback,
  isDisabled,
  onChange,
  question,
  value,
}: WrittenQuestionProps) {
  const selectedValue = typeof value === "string" ? value : "";

  return (
    <QuestionShell feedback={feedback} title={question.headerText}>
      <div className="flex flex-col gap-4">
        <Label className="flex flex-col items-start gap-2">
          <span className="font-medium">Your answer</span>
          <Input
            autoComplete="off"
            disabled={isDisabled}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isDisabled) {
                event.preventDefault();
              }
            }}
            placeholder="Type here"
            value={selectedValue}
          />
        </Label>
        <p className="text-muted-foreground text-sm">
          lowercase and whitespace are ignored.
        </p>
      </div>
    </QuestionShell>
  );
}
