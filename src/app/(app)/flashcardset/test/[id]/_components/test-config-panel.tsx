"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TestConfig } from "../_lib/types";

export function TestConfigPanel({
  config,
  questionCount,
}: {
  config: TestConfig;
  questionCount: number;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Test setup</CardTitle>
        <CardDescription>Loaded from the route search params.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ConfigRow label="Questions" value={questionCount.toString()} />
          <ConfigRow
            label="Answer with"
            value={config.answerWith === "term" ? "Term" : "Definition"}
          />
          <ConfigRow
            label="Instant response"
            value={config.instantResponse ? "Enabled" : "Disabled"}
          />
          <ConfigRow
            label="Back navigation"
            value={config.allowBackNavigation ? "Enabled" : "Disabled"}
          />
          <ConfigRow
            label="Selected types"
            value={config.selectedQuestionTypes
              .map((type) => type.replaceAll("_", " "))
              .join(", ")}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <dt className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
