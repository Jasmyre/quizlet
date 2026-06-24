"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TestAnswer, TestFeedback, TestQuestion } from "../../_lib/types";
import { QuestionShell } from "../question-shell";

const matchingKeys = ["A", "B", "C", "D"] as const;

export function MatchingQuestion({
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
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border bg-background p-4">
          <p className="text-muted-foreground text-sm">
            Type the matching letter for the answer side.
          </p>
          <div className="mt-4 space-y-3">
            {question.matchingChoices?.map((choice) => (
              <div
                className="flex items-start gap-3 rounded-lg border bg-card p-3"
                key={`${question.id}-${choice.key}`}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted font-medium text-sm">
                  {choice.key}
                </div>
                <p className="text-card-foreground text-sm leading-relaxed">
                  {choice.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="space-y-2">
            <span className="font-medium">Your answer</span>
            <Input
              autoComplete="off"
              disabled={isDisabled}
              inputMode="text"
              maxLength={1}
              onChange={(event) => {
                const nextValue = event.target.value.trim().toUpperCase();
                if (
                  nextValue.length === 0 ||
                  matchingKeys.includes(
                    nextValue as (typeof matchingKeys)[number]
                  )
                ) {
                  onChange(nextValue);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isDisabled) {
                  event.preventDefault();
                }
              }}
              placeholder="A"
              value={selectedValue}
            />
          </Label>
          <p className="text-muted-foreground text-sm">
            Choose the letter that matches the correct answer.
          </p>
        </div>
      </div>
    </QuestionShell>
  );
}
