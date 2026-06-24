// Depends on the shared question shell and shadcn RadioGroup primitives for the binary choice input.
"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
        <RadioGroup
          className="grid gap-3 sm:grid-cols-2"
          disabled={isDisabled}
          onValueChange={(nextValue) => onChange(nextValue === "true")}
          value={selectedValue}
        >
          <Choice
            description="The statement is correct."
            label="True"
            value="true"
          />
          <Choice
            description="The statement is not correct."
            label="False"
            value="false"
          />
        </RadioGroup>
      </div>
    </QuestionShell>
  );
}

function Choice({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <Label className="flex cursor-pointer flex-col gap-2 rounded-xl border bg-background p-4 transition-colors hover:bg-muted/40 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
      <div className="flex items-center gap-3">
        <RadioGroupItem value={value} />
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-muted-foreground text-sm">{description}</span>
    </Label>
  );
}
