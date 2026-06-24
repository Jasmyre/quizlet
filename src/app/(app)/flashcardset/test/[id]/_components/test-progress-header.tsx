"use client";

import { Progress } from "@/components/ui/progress";

export function TestProgressHeader({
  correctCount,
  disabledScoreLabel,
  progressValue,
  questionIndex,
  totalQuestions,
}: {
  correctCount: number;
  disabledScoreLabel?: string;
  progressValue: number;
  questionIndex: number;
  totalQuestions: number;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Progress</p>
          <p className="font-heading font-semibold text-2xl tracking-tight">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-sm">Score</p>
          <p className="font-medium text-sm">
            {disabledScoreLabel ?? `${correctCount} / ${totalQuestions}`}
          </p>
        </div>
      </div>
      <Progress aria-label="Test progress" value={progressValue} />
    </div>
  );
}
