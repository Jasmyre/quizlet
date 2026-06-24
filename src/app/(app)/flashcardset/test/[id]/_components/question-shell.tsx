// Depends on the shared feedback model and wraps every question component with the same card chrome.
"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TestFeedback } from "../_lib/types";

export function QuestionShell({
  children,
  feedback,
  title,
}: {
  children: ReactNode;
  feedback: TestFeedback | null;
  title: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-2xl leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-6">
        {children}
        {feedback ? (
          <div
            aria-live="polite"
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              feedback.wasCorrect
                ? "border-primary/30 bg-primary/10 text-foreground"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            )}
          >
            <p className="font-medium">
              {feedback.wasCorrect ? "Correct" : "Incorrect"}
            </p>
            {feedback.wasCorrect ? null : (
              <p className="mt-1">
                Correct answer:{" "}
                <span className="font-medium">
                  {feedback.correctAnswerText}
                </span>
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
