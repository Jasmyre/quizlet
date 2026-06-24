"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { TestAnswer, TestFeedback, TestQuestion } from "../../_lib/types";
import { QuestionShell } from "../question-shell";

export function MultipleChoiceQuestion({
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
      <RadioGroup
        className="grid gap-3"
        disabled={isDisabled}
        onValueChange={(nextValue) => onChange(nextValue)}
        value={selectedValue}
      >
        {question.choices?.map((choice, index) => (
          <Label
            className="flex cursor-pointer flex-col gap-2 rounded-xl border bg-background p-4 transition-colors hover:bg-muted/40 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
            key={`${question.id}-${choice}`}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value={choice} />
              <span className="font-medium">Option {index + 1}</span>
            </div>
            <span className="text-muted-foreground text-sm">{choice}</span>
          </Label>
        ))}
      </RadioGroup>
    </QuestionShell>
  );
}
