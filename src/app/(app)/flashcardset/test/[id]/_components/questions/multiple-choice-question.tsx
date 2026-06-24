// Depends on the shared question shell and shadcn Card primitives for the selectable choice hitboxes.
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TestAnswer, TestFeedback, TestQuestion } from "../../_lib/types";
import { QuestionShell } from "../question-shell";

interface MultipleChoiceQuestionProps {
  feedback: TestFeedback | null;
  isDisabled: boolean;
  onChange: (value: TestAnswer) => void;
  question: Extract<TestQuestion, { type: "multiple_choice" }>;
  value: TestAnswer | undefined;
}

export function MultipleChoiceQuestion({
  feedback,
  isDisabled,
  onChange,
  question,
  value,
}: MultipleChoiceQuestionProps) {
  const selectedValue = typeof value === "string" ? value : "";

  return (
    <QuestionShell feedback={feedback} title={question.headerText}>
      <div className="flex flex-col gap-3">
        {question.choices.map((choice, index) => {
          const isSelected = selectedValue === choice;

          return (
            <Card
              className={cn(
                "cursor-pointer border transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "hover:border-primary/40 hover:bg-muted/40",
                isDisabled && "cursor-not-allowed opacity-70"
              )}
              key={`${question.id}-${choice}`}
              onClick={() => {
                if (!isDisabled) {
                  onChange(choice);
                }
              }}
              onKeyDown={(event) => {
                if (isDisabled) {
                  return;
                }

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onChange(choice);
                }
              }}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                      Option {index + 1}
                    </p>
                    <p className="font-medium text-sm leading-relaxed">
                      {choice}
                    </p>
                  </div>
                  {isSelected ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary text-xs">
                      Selected
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </QuestionShell>
  );
}
