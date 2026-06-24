// Depends on the question bank output and the test-session response log to compute the final score.
import { normalizeAnswer } from "./normalize-answer";
import type {
  MatchingAssignments,
  TestQuestion,
  TestResponse,
  TestResponseRecord,
  TestSessionSummary,
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
    const wasCorrect = record ? isCorrectAnswer(question, userResponse) : false;

    return {
      answeredAt: record?.answeredAt ?? "",
      correctAnswerText: question.correctAnswerText,
      flashcardIds: record?.flashcardIds ?? question.flashcardIds,
      questionId: question.id,
      type: question.type,
      userResponse,
      wasCorrect,
    };
  });

  const correctCount = responses.filter(
    (response) => response.wasCorrect
  ).length;
  const scorePercent =
    responses.length === 0
      ? 0
      : Math.round((correctCount / responses.length) * 100);

  return {
    correctCount,
    responses,
    scorePercent,
    timeTakenMs,
    totalQuestions: questions.length,
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
