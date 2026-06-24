"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TestSessionSummary } from "../_lib/types";

export function TestCompleteCard({
  sessionId,
  summary,
}: {
  sessionId: string;
  summary: TestSessionSummary;
}) {
  const elapsedSeconds = Math.max(1, Math.round(summary.timeTakenMs / 1000));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-2xl">Test complete</CardTitle>
        <CardDescription>
          Session {sessionId} finished with {summary.correctCount} correct
          answers out of {summary.totalQuestions}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Score" value={`${summary.scorePercent}%`} />
          <Metric
            label="Correct"
            value={`${summary.correctCount} / ${summary.totalQuestions}`}
          />
          <Metric label="Time" value={`${minutes}m ${seconds}s`} />
        </div>

        <div className="rounded-xl border bg-background p-4">
          <p className="text-muted-foreground text-sm">
            A detailed session log was written to the console, including each
            question response and correctness flag.
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
