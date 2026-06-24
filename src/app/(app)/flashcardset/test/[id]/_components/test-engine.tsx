// Depends on the mock deck, question-bank builder, config parser, and question components that power the flashcard test route.
"use client";

import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { mockFlashcards } from "../_data/mock-data";
import { buildQuestionBank } from "../_lib/build-question-bank";
import { parseTestConfig } from "../_lib/parse-test-config";
import type { TestAnswer, TestFeedback, TestQuestion } from "../_lib/types";
import { useTestSession } from "../_lib/use-test-session";
import { MatchingQuestion } from "./questions/matching-question";
import { MultipleChoiceQuestion } from "./questions/multiple-choice-question";
import { TrueFalseQuestion } from "./questions/true-false-question";
import { WrittenQuestion } from "./questions/written-question";
import { TestCompleteCard } from "./test-complete-card";
import { TestConfigPanel } from "./test-config-panel";
import { TestProgressHeader } from "./test-progress-header";

interface TestEngineProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const EMPTY_QUESTIONS: TestQuestion[] = [];

export function TestEngine({ searchParams }: TestEngineProps) {
  const config = useMemo(() => parseTestConfig(searchParams), [searchParams]);
  const [isMounted, setIsMounted] = useState(false);
  const [questions, setQuestions] = useState<TestQuestion[] | null>(null);
  const resolvedQuestions = questions ?? EMPTY_QUESTIONS;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    setQuestions(null);
    const nextQuestions = buildQuestionBank({
      config,
      flashcards: mockFlashcards,
    });
    setQuestions(nextQuestions);
  }, [config, isMounted]);

  const shouldInstantResponse = useMemo(
    () => (question: TestQuestion) =>
      config.instantResponse &&
      question.type !== "matching" &&
      question.type !== "written",
    [config.instantResponse]
  );

  const {
    clearReveal,
    commitCurrentAnswer,
    currentDraftAnswer,
    currentIndex,
    currentQuestion,
    currentReveal,
    goNext,
    goPrevious,
    isComplete,
    isCurrentQuestionLocked,
    setDraftAnswer,
    summary,
  } = useTestSession({
    config,
    questions: questions ?? [],
    shouldInstantResponse,
  });

  const autoAdvanceTimerRef = useRef<number | null>(null);
  const hasLoggedCompletionRef = useRef(false);
  const loggedSessionKeyRef = useRef("");

  useEffect(() => {
    const nextSessionKey = resolvedQuestions
      .map((question) => question.id)
      .join("|");

    if (loggedSessionKeyRef.current === nextSessionKey) {
      return;
    }

    loggedSessionKeyRef.current = nextSessionKey;
    hasLoggedCompletionRef.current = false;
  }, [resolvedQuestions]);

  useEffect(() => {
    if (!(currentQuestion && currentReveal)) {
      return;
    }

    if (!shouldInstantResponse(currentQuestion)) {
      return;
    }

    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
    }

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      clearReveal();
      goNext();
    }, 1000);

    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [
    clearReveal,
    currentQuestion,
    currentReveal,
    goNext,
    shouldInstantResponse,
  ]);

  useEffect(() => {
    if (!isComplete || hasLoggedCompletionRef.current) {
      return;
    }

    hasLoggedCompletionRef.current = true;
  }, [isComplete]);

  if (!isMounted || questions === null) {
    return <LoadingShell />;
  }

  if (resolvedQuestions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <CardTitle className="text-2xl">No questions available</CardTitle>
          <CardDescription className="max-w-lg">
            The current test configuration did not produce any questions from
            the mock deck.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (isComplete || !currentQuestion) {
    return <TestCompleteCard summary={summary} />;
  }

  const currentFeedback =
    currentReveal?.questionId === currentQuestion.id ? currentReveal : null;
  const progressValue = ((currentIndex + 1) / resolvedQuestions.length) * 100;
  const canContinue = isAnswerReady(currentQuestion, currentDraftAnswer);
  const isInstantQuestion = shouldInstantResponse(currentQuestion);
  const scoreLabel =
    config.instantResponse || isComplete
      ? `${summary.correctCount} / ${summary.totalQuestions}`
      : "Score hidden until the end";

  const handleContinue = (): void => {
    if (currentReveal?.questionId === currentQuestion.id) {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      clearReveal();
      goNext();
      return;
    }

    const committed = commitCurrentAnswer();

    if (!committed) {
      return;
    }

    if (!isInstantQuestion) {
      goNext();
    }
  };

  const handleChange = (value: TestAnswer): void => {
    if (isInstantQuestion) {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      commitCurrentAnswer(value);
      return;
    }

    setDraftAnswer(currentQuestion.id, value);
  };

  return (
    <div className="flex flex-col gap-6">
      <TestProgressHeader
        correctCount={summary.correctCount}
        disabledScoreLabel={scoreLabel}
        progressValue={progressValue}
        questionIndex={currentIndex}
        totalQuestions={resolvedQuestions.length}
      />

      <TestConfigPanel
        config={config}
        questionCount={resolvedQuestions.length}
      />

      {renderQuestion({
        currentDraftAnswer,
        currentFeedback,
        currentQuestion,
        handleChange,
        isCurrentQuestionLocked,
        value: currentDraftAnswer,
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span>
            {currentIndex + 1} of {resolvedQuestions.length}
          </span>
          <Separator className="h-4" orientation="vertical" />
          <span>
            {config.instantResponse
              ? "Instant response enabled"
              : "Manual review mode"}
          </span>
        </div>
        <div className="flex gap-2">
          {config.allowBackNavigation ? (
            <Button
              disabled={currentIndex === 0}
              onClick={goPrevious}
              type="button"
              variant="outline"
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Previous
            </Button>
          ) : null}
          <Button
            disabled={!canContinue}
            onClick={handleContinue}
            type="button"
          >
            {currentReveal?.questionId === currentQuestion.id ? (
              <>
                <CheckIcon data-icon="inline-start" />
                Continue
              </>
            ) : currentIndex === resolvedQuestions.length - 1 ? (
              <>
                Finish
                <ChevronRightIcon data-icon="inline-end" />
              </>
            ) : (
              <>
                Continue
                <ChevronRightIcon data-icon="inline-end" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderQuestion({
  currentDraftAnswer,
  currentFeedback,
  currentQuestion,
  handleChange,
  isCurrentQuestionLocked,
  value,
}: {
  currentDraftAnswer: TestAnswer | undefined;
  currentFeedback: TestFeedback | null;
  currentQuestion: TestQuestion;
  handleChange: (value: TestAnswer) => void;
  isCurrentQuestionLocked: boolean;
  value: TestAnswer | undefined;
}) {
  const baseProps = {
    feedback: currentFeedback,
    isDisabled: isCurrentQuestionLocked,
    onChange: handleChange,
    value: currentDraftAnswer ?? value,
  };
  const questionKey = currentQuestion.id;

  switch (currentQuestion.type) {
    case "true_false":
      return (
        <TrueFalseQuestion
          {...baseProps}
          key={questionKey}
          question={currentQuestion}
        />
      );
    case "multiple_choice":
      return (
        <MultipleChoiceQuestion
          {...baseProps}
          key={questionKey}
          question={currentQuestion}
        />
      );
    case "matching":
      return (
        <MatchingQuestion
          {...baseProps}
          key={questionKey}
          question={currentQuestion}
        />
      );
    case "written":
      return (
        <WrittenQuestion
          {...baseProps}
          key={questionKey}
          question={currentQuestion}
        />
      );
    default:
      return null;
  }
}

function isAnswerReady(question: TestQuestion, value: TestAnswer | undefined) {
  if (value === undefined || value === null) {
    return false;
  }

  if (question.type === "true_false") {
    return typeof value === "boolean";
  }

  if (question.type === "matching") {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    return question.slots.every((slot) => {
      const assignment = value[slot.id];

      return typeof assignment === "string" && assignment.trim().length > 0;
    });
  }

  return typeof value === "string" && value.trim().length > 0;
}

function LoadingShell() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-2xl">
          <Skeleton className="h-8 w-56" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-80" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <span>Preparing your test…</span>
        </div>
      </CardContent>
    </Card>
  );
}
