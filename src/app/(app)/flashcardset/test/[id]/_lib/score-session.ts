// Depends on the question bank output and the test-session response log to compute the final score.
import { normalizeAnswer } from "./normalize-answer";
import type {
  MatchingAssignments,
  TestQuestion,
  TestResponse,
  TestResponseRecord,
  TestSessionSummary,
  TestSlideResponseRecord,
} from "./types";

export function isCorrectAnswer(
  question: TestQuestion,
  userResponse: TestResponseRecord["userResponse"]
): boolean {
  switch (question.type) {
    case "true_false":
      return userResponse === question.correctAnswer;
    case "multiple_choice":
    case "written":
      return (
        typeof userResponse === "string" &&
        normalizeAnswer(userResponse) ===
          normalizeAnswer(question.correctAnswerText)
      );
    case "matching":
      return matchesAssignments(userResponse, question.correctAnswer);
    default:
      return false;
  }
}

export function scoreSession({
  questions,
  records,
  timeTakenMs,
}: {
  questions: TestQuestion[];
  records: Record<string, TestResponseRecord>;
  timeTakenMs: number;
}): TestSessionSummary {
  const responses: TestResponse[] = questions.map((question) => {
    const record = records[question.id];
    const userResponse = record?.userResponse ?? "";
    const possiblePoints = question.pointWeight ?? 1;
    const wasCorrect = record ? isCorrectAnswer(question, userResponse) : false;

    return {
      answeredAt: record?.answeredAt ?? "",
      correctAnswerText: question.correctAnswerText,
      earnedPoints: wasCorrect ? possiblePoints : 0,
      flashcardIds: record?.flashcardIds ?? question.flashcardIds,
      possiblePoints,
      questionId: question.id,
      type: question.type,
      userResponse,
      wasCorrect,
    };
  });

  const correctCount = responses.filter(
    (response) => response.wasCorrect
  ).length;
  const totalPoints = questions.reduce(
    (sum, question) => sum + (question.pointWeight ?? 1),
    0
  );
  const correctPoints = responses.reduce(
    (sum, response) => sum + response.earnedPoints,
    0
  );
  const scorePercent =
    totalPoints === 0 ? 0 : Math.round((correctPoints / totalPoints) * 100);

  return {
    correctCount,
    correctPoints,
    responses,
    scorePercent,
    timeTakenMs,
    totalPoints,
    totalQuestions: questions.length,
    totalSlides: questions.length,
  };
}

export function scoreSlideSession({
  questions,
  records,
  timeTakenMs,
}: {
  questions: TestQuestion[];
  records: Record<string, TestSlideResponseRecord>;
  timeTakenMs: number;
}): TestSessionSummary {
  const responses: TestResponse[] = questions.map((question) => {
    const record = records[question.id];
    const userResponse = record?.userResponse ?? "";
    const possiblePoints = question.pointWeight ?? 1;
    const earnedPoints = record?.earnedPoints ?? 0;
    const wasCorrect = record ? record.wasCorrect : false;

    return {
      answeredAt: record?.answeredAt ?? "",
      correctAnswerText: question.correctAnswerText,
      earnedPoints,
      flashcardIds: record?.flashcardIds ?? question.flashcardIds,
      possiblePoints,
      questionId: question.id,
      type: question.type,
      userResponse,
      wasCorrect,
    };
  });

  const correctCount = responses.filter(
    (response) => response.wasCorrect
  ).length;
  const totalPoints = questions.reduce(
    (sum, question) => sum + (question.pointWeight ?? 1),
    0
  );
  const correctPoints = responses.reduce(
    (sum, response) => sum + response.earnedPoints,
    0
  );
  const scorePercent =
    totalPoints === 0 ? 0 : Math.round((correctPoints / totalPoints) * 100);

  return {
    correctCount,
    correctPoints,
    responses,
    scorePercent,
    timeTakenMs,
    totalPoints,
    totalQuestions: questions.length,
    totalSlides: questions.length,
  };
}

function matchesAssignments(
  userResponse: TestResponseRecord["userResponse"],
  correctAnswer: MatchingAssignments
): boolean {
  if (typeof userResponse !== "object" || userResponse === null) {
    return false;
  }

  const responseEntries = Object.entries(userResponse);
  const correctEntries = Object.entries(correctAnswer);

  if (responseEntries.length !== correctEntries.length) {
    return false;
  }

  return correctEntries.every(([slotId, answerId]) => {
    const userAnswerId = (userResponse as MatchingAssignments)[slotId];

    return (
      typeof userAnswerId === "string" &&
      normalizeAnswer(userAnswerId) === normalizeAnswer(answerId)
    );
  });
}
