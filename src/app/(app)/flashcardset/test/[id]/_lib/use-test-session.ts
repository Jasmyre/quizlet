"use client";

import { useMemo, useRef, useState } from "react";
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
}

interface CommitResult {
  feedback: TestFeedback;
  record: TestResponseRecord;
}

interface RevealState extends TestFeedback {
  questionId: string;
}

export function useTestSession({ config, questions }: UseTestSessionOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswersByQuestionId, setDraftAnswersByQuestionId] = useState<
    Record<string, TestAnswer | undefined>
  >({});
  const [committedResponsesByQuestionId, setCommittedResponsesByQuestionId] =
    useState<Record<string, TestResponseRecord>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [revealState, setRevealState] = useState<RevealState | null>(null);
  const startedAtRef = useRef(Date.now());

  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.id;
  const currentDraftAnswer =
    currentQuestionId === undefined
      ? undefined
      : (draftAnswersByQuestionId[currentQuestionId] ??
        committedResponsesByQuestionId[currentQuestionId]?.userResponse);
  const currentCommittedRecord =
    currentQuestionId === undefined
      ? undefined
      : committedResponsesByQuestionId[currentQuestionId];
  const currentReveal =
    revealState?.questionId === currentQuestionId ? revealState : null;
  const isCurrentQuestionLocked =
    revealState?.questionId === currentQuestionId &&
    config.instantResponse &&
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
      questionId: currentQuestion.id,
      flashcardId: currentQuestion.flashcardId,
      type: currentQuestion.type,
      userResponse: rawAnswer,
      answeredAt,
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
      wasCorrect: isCorrectAnswer(currentQuestion, rawAnswer),
      correctAnswerText: currentQuestion.correctAnswerText,
      userResponse: rawAnswer,
    };

    if (config.instantResponse) {
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
    completedAt === null
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
    completedAt,
    currentCommittedRecord,
    currentDraftAnswer,
    currentIndex,
    currentQuestion,
    currentReveal,
    draftAnswersByQuestionId,
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

  return typeof value === "string" && value.trim().length > 0;
}
