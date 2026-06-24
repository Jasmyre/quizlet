// Depends on the computed test-session summary that the engine produces at the end of the run.
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TestSessionSummary } from "../_lib/types";

interface TestCompleteCardProps {
  summary: TestSessionSummary;
}

export function TestCompleteCard({ summary }: TestCompleteCardProps) {
  const elapsedSeconds = Math.max(1, Math.round(summary.timeTakenMs / 1000));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-2xl">Test complete</CardTitle>
        <CardDescription>
          You earned {summary.correctPoints} out of {summary.totalPoints} points
          across {summary.totalQuestions} questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Score" value={`${summary.scorePercent}%`} />
          <Metric
            label="Points"
            value={`${summary.correctPoints} / ${summary.totalPoints}`}
          />
          <Metric label="Time" value={`${minutes}m ${seconds}s`} />
        </div>

        <div className="rounded-xl border bg-background p-4">
          <p className="text-muted-foreground text-sm">
            Your score, timing, and per-question results are summarized above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-2 font-heading font-semibold text-2xl tracking-tight">
        {value}
      </p>
    </div>
  );
}
