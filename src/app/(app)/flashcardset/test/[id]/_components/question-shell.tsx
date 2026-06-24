"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TestFeedback, TestQuestion } from "../_lib/types";

export function QuestionShell({
  children,
  feedback,
  question,
  questionIndex,
  totalQuestions,
}: {
  children: ReactNode;
  feedback: TestFeedback | null;
  question: TestQuestion;
  questionIndex: number;
  totalQuestions: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 border-b bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardDescription className="text-xs uppercase tracking-[0.24em]">
            Question {questionIndex + 1} of {totalQuestions}
          </CardDescription>
          <CardDescription className="text-xs uppercase tracking-[0.24em]">
            {question.type.replaceAll("_", " ")}
          </CardDescription>
        </div>
        <CardTitle className="text-balance text-2xl leading-tight">
          {question.prompt}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {children}
        {feedback ? (
          <div
            aria-live="polite"
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              feedback.wasCorrect
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
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
