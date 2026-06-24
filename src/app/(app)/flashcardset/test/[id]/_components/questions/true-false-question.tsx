// Depends on the shared question shell and shadcn Card primitives for the binary choice input.
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TestAnswer, TestFeedback, TestQuestion } from "../../_lib/types";
import { QuestionShell } from "../question-shell";

interface TrueFalseQuestionProps {
  feedback: TestFeedback | null;
  isDisabled: boolean;
  onChange: (value: TestAnswer) => void;
  question: Extract<TestQuestion, { type: "true_false" }>;
  value: TestAnswer | undefined;
}

export function TrueFalseQuestion({
  feedback,
  isDisabled,
  onChange,
  question,
  value,
}: TrueFalseQuestionProps) {
  const selectedValue =
    typeof value === "boolean" ? (value ? "true" : "false") : "";

  return (
    <QuestionShell feedback={feedback} title={question.headerText}>
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Choose whether the prompt is true or false.
        </p>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-sm leading-relaxed">{question.statementText}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice
            description="The statement is correct."
            isDisabled={isDisabled}
            isSelected={selectedValue === "true"}
            label="True"
            onSelect={() => onChange(true)}
          />
          <Choice
            description="The statement is not correct."
            isDisabled={isDisabled}
            isSelected={selectedValue === "false"}
            label="False"
            onSelect={() => onChange(false)}
          />
        </div>
      </div>
    </QuestionShell>
  );
}

function Choice({
  description,
  isDisabled,
  isSelected,
  label,
  onSelect,
}: {
  description: string;
  isDisabled: boolean;
  isSelected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer border transition-colors",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary"
          : "hover:border-primary/40 hover:bg-muted/40",
        isDisabled && "cursor-not-allowed opacity-70"
      )}
      onClick={() => {
        if (!isDisabled) {
          onSelect();
        }
      }}
      onKeyDown={(event) => {
        if (isDisabled) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground text-sm">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}
