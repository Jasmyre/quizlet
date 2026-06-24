import { normalizeAnswer } from "./normalize-answer";
import type {
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
      return (
        typeof userResponse === "string" &&
        normalizeAnswer(userResponse) ===
          normalizeAnswer(String(question.correctAnswer))
      );
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
      questionId: question.id,
      flashcardId: question.flashcardId,
      type: question.type,
      userResponse,
      wasCorrect,
      answeredAt: record?.answeredAt ?? "",
      correctAnswerText: question.correctAnswerText,
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
    totalQuestions: questions.length,
    correctCount,
    scorePercent,
    timeTakenMs,
    responses,
  };
}
