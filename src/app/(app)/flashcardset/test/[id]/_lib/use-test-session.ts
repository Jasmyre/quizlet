// Depends on the question bank output and owns the mutable answer log for the engine UI.
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isCorrectAnswer, scoreSession } from "./score-session";
import type {
  TestAnswer,
  TestConfig,
  TestFeedback,
  TestQuestion,
  TestResponseRecord,
  TestSessionSummary,
} from "./types";

interface UseTestSessionOptions {
  config: TestConfig;
  questions: TestQuestion[];
  shouldInstantResponse: (question: TestQuestion) => boolean;
}

interface CommitResult {
  feedback: TestFeedback;
  record: TestResponseRecord;
}

interface RevealState extends TestFeedback {
  questionId: string;
}

export function useTestSession({
  config,
  questions,
  shouldInstantResponse,
}: UseTestSessionOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswersByQuestionId, setDraftAnswersByQuestionId] = useState<
    Record<string, TestAnswer | undefined>
  >({});
  const [committedResponsesByQuestionId, setCommittedResponsesByQuestionId] =
    useState<Record<string, TestResponseRecord>>({});
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [revealState, setRevealState] = useState<RevealState | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const questionsKeyRef = useRef<string>("");

  useEffect(() => {
    const nextQuestionsKey = questions.map((question) => question.id).join("|");

    if (questionsKeyRef.current === nextQuestionsKey) {
      return;
    }

    questionsKeyRef.current = nextQuestionsKey;
    startedAtRef.current = null;
    setCurrentIndex(0);
    setDraftAnswersByQuestionId({});
    setCommittedResponsesByQuestionId({});
    setCompletedAt(null);
    setIsComplete(false);
    setRevealState(null);
  }, [questions]);

  useEffect(() => {
    if (questions.length === 0 || startedAtRef.current !== null) {
      return;
    }

    startedAtRef.current = Date.now();
  }, [questions.length]);

  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.id;
  const currentQuestionUsesInstantResponse = currentQuestion
    ? shouldInstantResponse(currentQuestion)
    : false;
  const currentDraftAnswer =
    currentQuestionId === undefined
      ? undefined
      : (draftAnswersByQuestionId[currentQuestionId] ??
        committedResponsesByQuestionId[currentQuestionId]?.userResponse);
  const currentReveal =
    revealState?.questionId === currentQuestionId ? revealState : null;
  const isCurrentQuestionLocked =
    revealState?.questionId === currentQuestionId &&
    currentQuestionUsesInstantResponse &&
    !isComplete;

  const setDraftAnswer = (questionId: string, value: TestAnswer): void => {
    setDraftAnswersByQuestionId((currentValue) => ({
      ...currentValue,
      [questionId]: value,
    }));
  };

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
    const record: TestResponseRecord = {
      answeredAt,
      flashcardIds: currentQuestion.flashcardIds,
      questionId: currentQuestion.id,
      type: currentQuestion.type,
      userResponse: rawAnswer,
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
      wasCorrect: isCorrectAnswer(currentQuestion, rawAnswer),
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

  const clearReveal = (): void => {
    setRevealState(null);
  };

  const goNext = (): void => {
    clearReveal();

    setCurrentIndex((currentValue) => {
      if (currentValue >= questions.length - 1) {
        setIsComplete(true);
        setCompletedAt(Date.now());
        return currentValue;
      }

      return currentValue + 1;
    });
  };

  const goPrevious = (): void => {
    if (!config.allowBackNavigation) {
      return;
    }

    clearReveal();
    setCurrentIndex((currentValue) => Math.max(0, currentValue - 1));
  };

  const timeTakenMs =
    startedAtRef.current === null
      ? 0
      : completedAt === null
        ? Date.now() - startedAtRef.current
        : completedAt - startedAtRef.current;

  const summary = useMemo<TestSessionSummary>(
    () =>
      scoreSession({
        questions,
        records: committedResponsesByQuestionId,
        timeTakenMs,
      }),
    [committedResponsesByQuestionId, questions, timeTakenMs]
  );

  return {
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
  };
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
