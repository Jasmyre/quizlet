"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TestAnswer, TestFeedback, TestQuestion } from "../../_lib/types";
import { QuestionShell } from "../question-shell";

export function WrittenQuestion({
  feedback,
  isDisabled,
  onChange,
  questionIndex,
  totalQuestions,
  question,
  value,
}: {
  feedback: TestFeedback | null;
  isDisabled: boolean;
  onChange: (value: TestAnswer) => void;
  questionIndex: number;
  totalQuestions: number;
  question: TestQuestion;
  value: TestAnswer | undefined;
}) {
  const selectedValue = typeof value === "string" ? value : "";

  return (
    <QuestionShell
      feedback={feedback}
      question={question}
      questionIndex={questionIndex}
      totalQuestions={totalQuestions}
    >
      <Label className="space-y-2">
        <span className="font-medium">Type your answer</span>
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
    </QuestionShell>
  );
}
