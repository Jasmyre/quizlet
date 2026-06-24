// Depends on the flashcard deck provided by the route, slide generator, config parser, and question components.
"use client";

import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
} from "lucide-react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  buildMatchingSlideQuestion,
  buildSlideQuestion,
} from "../_lib/build-slide-question";
import { generateTestSequence } from "../_lib/generate-test-sequence";
import { normalizeAnswer } from "../_lib/normalize-answer";
import { parseTestConfig } from "../_lib/parse-test-config";
import { scoreSlideSession } from "../_lib/score-session";
import type {
  Flashcard,
  MatchingAssignments,
  TestAnswer,
  TestFeedback,
  TestQuestion,
  TestSessionSummary,
  TestSlide,
  TestSlideResponseRecord,
} from "../_lib/types";
import { MatchingBatchSlide } from "./questions/matching-batch-slide";
import { MultipleChoiceQuestion } from "./questions/multiple-choice-question";
import { TrueFalseQuestion } from "./questions/true-false-question";
import { WrittenQuestion } from "./questions/written-question";
import { TestCompleteCard } from "./test-complete-card";
import { TestProgressHeader } from "./test-progress-header";

interface TestEngineProps {
  flashcards: Flashcard[];
  searchParams: Record<string, string | string[] | undefined>;
}

export function TestEngine({ flashcards, searchParams }: TestEngineProps) {
  const config = useMemo(() => parseTestConfig(searchParams), [searchParams]);
  const [isMounted, setIsMounted] = useState(false);
  const [slides, setSlides] = useState<TestSlide[] | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    setSlides(null);
    const nextSlides = generateTestSequence(
      flashcards,
      config.selectedQuestionTypes
    );
    setSlides(nextSlides);
  }, [config.selectedQuestionTypes, flashcards, isMounted]);

  if (!isMounted || slides === null) {
    return <LoadingSkeleton />;
  }

  return (
    <TestEngineContent allCards={flashcards} config={config} slides={slides} />
  );
}

function TestEngineContent({
  allCards,
  config,
  slides,
}: {
  allCards: Flashcard[];
  config: ReturnType<typeof parseTestConfig>;
  slides: TestSlide[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswersByQuestionId, setDraftAnswersByQuestionId] = useState<
    Record<string, TestAnswer | undefined>
  >({});
  const [committedResponsesByQuestionId, setCommittedResponsesByQuestionId] =
    useState<Record<string, TestSlideResponseRecord>>({});
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [revealState, setRevealState] = useState<RevealState | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const slidesKeyRef = useRef<string>("");
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const questions = useMemo<TestQuestion[]>(
    () =>
      slides.map((slide, slideIndex) => {
        if (slide.type === "Matching") {
          return buildMatchingSlideQuestion({
            batch: slide.batch,
            config,
            slideIndex,
          });
        }

        return buildSlideQuestion({
          allCards,
          config,
          slide,
          slideIndex,
        });
      }),
    [allCards, config, slides]
  );

  useEffect(() => {
    syncTestEngineState({
      setCommittedResponsesByQuestionId,
      setCurrentIndex,
      setDraftAnswersByQuestionId,
      setIsComplete,
      setRevealState,
      slides,
      slidesKeyRef,
      startedAtRef,
      setCompletedAt,
    });
  }, [slides]);

  useEffect(() => {
    startTestTimer({ slides, startedAtRef });
  }, [slides]);

  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.id;
  const currentSlide = slides[currentIndex];
  const currentQuestionUsesInstantResponse = shouldUseInstantResponse({
    currentSlide,
    instantResponse: config.instantResponse,
  });
  const currentDraftAnswer =
    currentQuestionId === undefined
      ? undefined
      : (draftAnswersByQuestionId[currentQuestionId] ??
        committedResponsesByQuestionId[currentQuestionId]?.userResponse);
  const currentReveal = getCurrentReveal({
    currentQuestionId,
    revealState,
  });
  const isCurrentQuestionLocked =
    revealState?.questionId === currentQuestionId &&
    currentQuestionUsesInstantResponse &&
    !isComplete;

  const summary = useMemo(
    () =>
      scoreSlideSession({
        questions,
        records: committedResponsesByQuestionId,
        timeTakenMs: timeTakenMsFrom(startedAtRef.current, completedAt),
      }),
    [completedAt, committedResponsesByQuestionId, questions]
  );

  const clearReveal = useCallback((): void => {
    setRevealState(null);
  }, []);

  const commitCurrentAnswer = (
    overrideAnswer?: TestAnswer
  ): CommitResult | null => {
    if (!currentQuestion || currentQuestionId === undefined) {
      return null;
    }

    const rawAnswer =
      overrideAnswer ??
      draftAnswersByQuestionId[currentQuestionId] ??
      committedResponsesByQuestionId[currentQuestionId]?.userResponse;

    if (!isAnswerPresent(rawAnswer, currentQuestion)) {
      return null;
    }

    const answeredAt = new Date().toISOString();
    const scoring = scoreQuestion(currentQuestion, rawAnswer);
    const record: TestSlideResponseRecord = {
      answeredAt,
      earnedPoints: scoring.earnedPoints,
      flashcardIds: currentQuestion.flashcardIds,
      possiblePoints: scoring.possiblePoints,
      slideId: currentQuestion.id,
      type: questionTypeToSlideType(currentQuestion.type),
      userResponse: rawAnswer,
      wasCorrect: scoring.wasCorrect,
    };

    setDraftAnswersByQuestionId((currentValue) => ({
      ...currentValue,
      [currentQuestion.id]: rawAnswer,
    }));
    setCommittedResponsesByQuestionId((currentValue) => ({
      ...currentValue,
      [currentQuestion.id]: record,
    }));

    const feedback: TestFeedback = {
      correctAnswerText: currentQuestion.correctAnswerText,
      userResponse: rawAnswer,
      wasCorrect: scoring.wasCorrect,
    };

    if (currentQuestionUsesInstantResponse) {
      setRevealState({
        ...feedback,
        questionId: currentQuestion.id,
      });
    } else {
      setRevealState(null);
    }

    return { feedback, record };
  };

  const goNext = useCallback((): void => {
    clearReveal();

    setCurrentIndex((currentValue) => {
      if (currentValue >= slides.length - 1) {
        setIsComplete(true);
        setCompletedAt(Date.now());
        return currentValue;
      }

      return currentValue + 1;
    });
  }, [clearReveal, slides.length]);

  const goPrevious = (): void => {
    if (!config.allowBackNavigation) {
      return;
    }

    clearReveal();
    setCurrentIndex((currentValue) => Math.max(0, currentValue - 1));
  };

  useEffect(
    () =>
      scheduleAutoAdvance({
        autoAdvanceTimerRef,
        clearReveal,
        currentQuestion,
        currentQuestionUsesInstantResponse,
        currentReveal,
        goNext,
      }),
    [
      clearReveal,
      currentQuestion,
      currentQuestionUsesInstantResponse,
      currentReveal,
      goNext,
    ]
  );

  if (slides.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <CardTitle className="text-2xl">No slides available</CardTitle>
          <CardDescription className="max-w-lg">
            The current test configuration did not produce any slides from the
            mock deck.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (isComplete || !currentQuestion || !currentSlide) {
    return <TestCompleteCard summary={summary} />;
  }

  const progressValue = ((currentIndex + 1) / slides.length) * 100;
  const canContinue = getCanContinue({
    currentDraftAnswer,
    currentQuestion,
    currentSlide,
  });
  const scoreLabel = getScoreLabel({
    isComplete,
    instantResponse: config.instantResponse,
    summary,
  });
  const modeLabel = getModeLabel({
    currentSlide,
    instantResponse: config.instantResponse,
  });

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

    if (!currentQuestionUsesInstantResponse) {
      goNext();
    }
  };

  const handleChange = (value: TestAnswer): void => {
    if (currentQuestion.type === "matching") {
      return;
    }

    if (currentQuestionUsesInstantResponse) {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      commitCurrentAnswer(value);
      return;
    }

    setDraftAnswersByQuestionId((currentValue) => ({
      ...currentValue,
      [currentQuestion.id]: value,
    }));
  };

  const handleMatchingSubmit = (value: MatchingAssignments): void => {
    const committed = commitCurrentAnswer(value);

    if (!committed) {
      return;
    }

    goNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <TestProgressHeader
        correctCount={summary.correctCount}
        disabledScoreLabel={scoreLabel}
        progressValue={progressValue}
        slideIndex={currentIndex}
        totalSlides={slides.length}
      />

      {renderSlide({
        currentDraftAnswer,
        currentFeedback: getCurrentFeedback({
          currentQuestionId,
          currentReveal,
        }),
        currentQuestion,
        currentSlide,
        handleChange,
        handleMatchingSubmit,
        isCurrentQuestionLocked,
        value: currentDraftAnswer,
        committedValue:
          committedResponsesByQuestionId[currentQuestion.id]?.userResponse,
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span>
            {currentIndex + 1} of {slides.length}
          </span>
          <Separator className="h-4" orientation="vertical" />
          <span>{modeLabel}</span>
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
          {shouldRenderContinueButton(currentSlide) ? (
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
              ) : currentIndex === slides.length - 1 ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}

function syncTestEngineState({
  setCommittedResponsesByQuestionId,
  setCompletedAt,
  setCurrentIndex,
  setDraftAnswersByQuestionId,
  setIsComplete,
  setRevealState,
  slides,
  slidesKeyRef,
  startedAtRef,
}: {
  setCommittedResponsesByQuestionId: Dispatch<
    SetStateAction<Record<string, TestSlideResponseRecord>>
  >;
  setCompletedAt: Dispatch<SetStateAction<number | null>>;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setDraftAnswersByQuestionId: Dispatch<
    SetStateAction<Record<string, TestAnswer | undefined>>
  >;
  setIsComplete: Dispatch<SetStateAction<boolean>>;
  setRevealState: Dispatch<SetStateAction<RevealState | null>>;
  slides: TestSlide[];
  slidesKeyRef: MutableRefObject<string>;
  startedAtRef: MutableRefObject<number | null>;
}): void {
  const nextSlidesKey = slides
    .map((slide) =>
      slide.type === "Matching"
        ? `${slide.type}:${slide.batch.map((card) => card.id).join(",")}`
        : `${slide.type}:${slide.question.id}`
    )
    .join("|");

  if (slidesKeyRef.current === nextSlidesKey) {
    return;
  }

  slidesKeyRef.current = nextSlidesKey;
  startedAtRef.current = null;
  setCurrentIndex(0);
  setDraftAnswersByQuestionId({});
  setCommittedResponsesByQuestionId({});
  setCompletedAt(null);
  setIsComplete(false);
  setRevealState(null);
}

function startTestTimer({
  slides,
  startedAtRef,
}: {
  slides: TestSlide[];
  startedAtRef: MutableRefObject<number | null>;
}): void {
  if (slides.length === 0 || startedAtRef.current !== null) {
    return;
  }

  startedAtRef.current = Date.now();
}

function scheduleAutoAdvance({
  autoAdvanceTimerRef,
  clearReveal,
  currentQuestion,
  currentQuestionUsesInstantResponse,
  currentReveal,
  goNext,
}: {
  autoAdvanceTimerRef: MutableRefObject<number | null>;
  clearReveal: () => void;
  currentQuestion: TestQuestion | undefined;
  currentQuestionUsesInstantResponse: boolean;
  currentReveal: RevealState | null;
  goNext: () => void;
}): (() => void) | undefined {
  if (!(currentQuestion && currentReveal)) {
    return;
  }

  if (!currentQuestionUsesInstantResponse) {
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
}

function shouldUseInstantResponse({
  currentSlide,
  instantResponse,
}: {
  currentSlide: TestSlide | undefined;
  instantResponse: boolean;
}): boolean {
  if (currentSlide === undefined) {
    return false;
  }

  return currentSlide.type !== "Matching" && instantResponse;
}

function getCurrentReveal({
  currentQuestionId,
  revealState,
}: {
  currentQuestionId: string | undefined;
  revealState: RevealState | null;
}): RevealState | null {
  if (currentQuestionId === undefined) {
    return null;
  }

  return revealState?.questionId === currentQuestionId ? revealState : null;
}

function getCanContinue({
  currentDraftAnswer,
  currentQuestion,
  currentSlide,
}: {
  currentDraftAnswer: TestAnswer | undefined;
  currentQuestion: TestQuestion;
  currentSlide: TestSlide;
}): boolean {
  if (currentSlide.type === "Matching") {
    return false;
  }

  return isAnswerReady(currentQuestion, currentDraftAnswer);
}

function getScoreLabel({
  instantResponse,
  isComplete,
  summary,
}: {
  instantResponse: boolean;
  isComplete: boolean;
  summary: TestSessionSummary;
}): string {
  if (instantResponse || isComplete) {
    return `${summary.correctPoints} / ${summary.totalPoints}`;
  }

  return "Score hidden until the end";
}

function getModeLabel({
  currentSlide,
  instantResponse,
}: {
  currentSlide: TestSlide;
  instantResponse: boolean;
}): string {
  if (currentSlide.type === "Matching") {
    return "Batch review mode";
  }

  if (instantResponse) {
    return "Instant response enabled";
  }

  return "Manual review mode";
}

function getCurrentFeedback({
  currentQuestionId,
  currentReveal,
}: {
  currentQuestionId: string | undefined;
  currentReveal: RevealState | null;
}): TestFeedback | null {
  if (currentQuestionId === undefined) {
    return null;
  }

  return currentReveal?.questionId === currentQuestionId ? currentReveal : null;
}

function shouldRenderContinueButton(currentSlide: TestSlide): boolean {
  return currentSlide.type !== "Matching";
}

function renderSlide({
  committedValue,
  currentDraftAnswer,
  currentFeedback,
  currentQuestion,
  currentSlide,
  handleChange,
  handleMatchingSubmit,
  isCurrentQuestionLocked,
  value,
}: {
  committedValue: TestAnswer | undefined;
  currentDraftAnswer: TestAnswer | undefined;
  currentFeedback: TestFeedback | null;
  currentQuestion: TestQuestion;
  currentSlide: TestSlide;
  handleChange: (value: TestAnswer) => void;
  handleMatchingSubmit: (value: MatchingAssignments) => void;
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

  switch (currentSlide.type) {
    case "TrueFalse":
      return (
        <TrueFalseQuestion
          {...baseProps}
          key={questionKey}
          question={
            currentQuestion as Extract<TestQuestion, { type: "true_false" }>
          }
        />
      );
    case "MultipleChoice":
      return (
        <MultipleChoiceQuestion
          {...baseProps}
          key={questionKey}
          question={
            currentQuestion as Extract<
              TestQuestion,
              { type: "multiple_choice" }
            >
          }
        />
      );
    case "Written":
      return (
        <WrittenQuestion
          {...baseProps}
          key={questionKey}
          question={
            currentQuestion as Extract<TestQuestion, { type: "written" }>
          }
        />
      );
    case "Matching":
      return (
        <MatchingBatchSlide
          batch={currentSlide.batch}
          isDisabled={isCurrentQuestionLocked}
          key={questionKey}
          onSubmit={handleMatchingSubmit}
          question={
            currentQuestion as Extract<TestQuestion, { type: "matching" }>
          }
          value={committedValue as MatchingAssignments | undefined}
        />
      );
    default:
      return null;
  }
}

function scoreQuestion(
  question: TestQuestion,
  userResponse: TestAnswer
): {
  earnedPoints: number;
  possiblePoints: number;
  wasCorrect: boolean;
} {
  const possiblePoints = question.pointWeight ?? 1;

  if (question.type === "matching") {
    const scoredPoints = scoreMatchingAssignments(question, userResponse);

    return {
      earnedPoints: scoredPoints,
      possiblePoints,
      wasCorrect: scoredPoints === possiblePoints,
    };
  }

  const wasCorrect = isAnswerCorrect(question, userResponse);

  return {
    earnedPoints: wasCorrect ? possiblePoints : 0,
    possiblePoints,
    wasCorrect,
  };
}

function scoreMatchingAssignments(
  question: Extract<TestQuestion, { type: "matching" }>,
  userResponse: TestAnswer
): number {
  if (typeof userResponse !== "object" || userResponse === null) {
    return 0;
  }

  let scoredPoints = 0;

  for (const slot of question.slots) {
    const assignedAnswerId = userResponse[slot.id];

    if (
      typeof assignedAnswerId === "string" &&
      assignedAnswerId.trim().length > 0 &&
      normalizeAnswer(assignedAnswerId) === normalizeAnswer(slot.answerId)
    ) {
      scoredPoints += 1;
    }
  }

  return scoredPoints;
}

function isAnswerCorrect(
  question: TestQuestion,
  userResponse: TestAnswer
): boolean {
  if (question.type === "true_false") {
    return userResponse === question.correctAnswer;
  }

  if (question.type === "multiple_choice" || question.type === "written") {
    return (
      typeof userResponse === "string" &&
      normalizeAnswer(userResponse) ===
        normalizeAnswer(question.correctAnswerText)
    );
  }

  if (question.type === "matching") {
    return (
      scoreMatchingAssignments(question, userResponse) === question.slots.length
    );
  }

  return false;
}

function questionTypeToSlideType(
  questionType: TestQuestion["type"]
): TestSlideResponseRecord["type"] {
  switch (questionType) {
    case "true_false":
      return "TrueFalse";
    case "multiple_choice":
      return "MultipleChoice";
    case "matching":
      return "Matching";
    case "written":
      return "Written";
    default:
      return "Written";
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

function isAnswerPresent(
  value: TestAnswer | undefined,
  question: TestQuestion
): value is TestAnswer {
  if (value === undefined || value === null) {
    return false;
  }

  if (question.type === "true_false") {
    return typeof value === "boolean";
  }

  if (question.type === "matching") {
    return (
      typeof value === "object" &&
      value !== null &&
      question.slots.every((slot) => {
        const assignment = value[slot.id];

        return typeof assignment === "string" && assignment.trim().length > 0;
      })
    );
  }

  return typeof value === "string" && value.trim().length > 0;
}

function timeTakenMsFrom(
  startedAt: number | null,
  completedAt: number | null
): number {
  if (startedAt === null) {
    return 0;
  }

  if (completedAt === null) {
    return Date.now() - startedAt;
  }

  return completedAt - startedAt;
}

interface CommitResult {
  feedback: TestFeedback;
  record: TestSlideResponseRecord;
}

interface RevealState extends TestFeedback {
  questionId: string;
}

function LoadingSkeleton() {
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
