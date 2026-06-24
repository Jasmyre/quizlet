"use client";

import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { TestProgressHeader } from "./test-progress-header";

interface TestEngineProps {
  flashcardSetId: string;
  searchParams: Record<string, string | string[] | undefined>;
}

export function TestEngine({ flashcardSetId, searchParams }: TestEngineProps) {
  const config = useMemo(() => parseTestConfig(searchParams), [searchParams]);
  const questions = useMemo(
    () =>
      buildQuestionBank({
        answerWith: config.answerWith,
        config,
        flashcards: mockFlashcards,
      }),
    [config]
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
    timeTakenMs,
  } = useTestSession({ config, questions });

  const autoAdvanceTimerRef = useRef<number | null>(null);
  const hasLoggedCompletionRef = useRef(false);

  useEffect(() => {
    if (!(currentReveal && config.instantResponse)) {
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
  }, [clearReveal, config.instantResponse, currentReveal, goNext]);

  useEffect(() => {
    if (!isComplete || hasLoggedCompletionRef.current) {
      return;
    }

    hasLoggedCompletionRef.current = true;
    console.log("Flashcard test session complete", {
      flashcardSetId,
      config,
      completedAt: new Date().toISOString(),
      totalQuestions: summary.totalQuestions,
      correctCount: summary.correctCount,
      scorePercent: summary.scorePercent,
      timeTakenMs,
      responses: summary.responses.map((response) => ({
        questionId: response.questionId,
        userResponse: response.userResponse,
        wasCorrect: response.wasCorrect,
      })),
    });
  }, [
    config,
    flashcardSetId,
    isComplete,
    summary.correctCount,
    summary.responses,
    summary.scorePercent,
    summary.totalQuestions,
    timeTakenMs,
  ]);

  if (questions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <h2 className="font-heading font-semibold text-2xl">
            No questions available
          </h2>
          <p className="max-w-lg text-muted-foreground">
            The current test configuration did not produce any questions from
            the mock deck.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isComplete || !currentQuestion) {
    return (
      <div className="flex flex-col gap-6">
        <TestCompleteCard sessionId={flashcardSetId} summary={summary} />
      </div>
    );
  }

  const currentFeedback =
    currentReveal?.questionId === currentQuestion.id ? currentReveal : null;
  const progressValue = ((currentIndex + 1) / questions.length) * 100;
  const canContinue = isAnswerReady(currentQuestion, currentDraftAnswer);
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

    if (!config.instantResponse) {
      goNext();
    }
  };

  const handleChange = (value: TestAnswer): void => {
    if (config.instantResponse) {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      const committed = commitCurrentAnswer(value);

      if (!committed) {
        return;
      }

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
        totalQuestions={questions.length}
      />

      {renderQuestion({
        currentDraftAnswer,
        currentFeedback,
        currentQuestion,
        handleChange,
        isCurrentQuestionLocked,
        questionIndex: currentIndex,
        totalQuestions: questions.length,
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span>
            {currentIndex + 1} of {questions.length}
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
            ) : currentIndex === questions.length - 1 ? (
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
  questionIndex,
  totalQuestions,
}: {
  currentDraftAnswer: TestAnswer | undefined;
  currentFeedback: TestFeedback | null;
  currentQuestion: TestQuestion;
  handleChange: (value: TestAnswer) => void;
  isCurrentQuestionLocked: boolean;
  questionIndex: number;
  totalQuestions: number;
}) {
  const commonProps = {
    feedback: currentFeedback,
    isDisabled: isCurrentQuestionLocked,
    onChange: handleChange,
    questionIndex,
    question: currentQuestion,
    totalQuestions,
    value: currentDraftAnswer,
  };

  switch (currentQuestion.type) {
    case "true_false":
      return <TrueFalseQuestion {...commonProps} />;
    case "multiple_choice":
      return <MultipleChoiceQuestion {...commonProps} />;
    case "matching":
      return <MatchingQuestion {...commonProps} />;
    case "written":
      return <WrittenQuestion {...commonProps} />;
    default:
      return <WrittenQuestion {...commonProps} />;
  }
}

function isAnswerReady(question: TestQuestion, value: TestAnswer | undefined) {
  if (value === undefined || value === null) {
    return false;
  }

  if (question.type === "true_false") {
    return typeof value === "boolean";
  }

  return typeof value === "string" && value.trim().length > 0;
}
