// Depends on the available test types and the shuffled deck order produced by the client engine.
import type { QuestionType } from "./types";

const defaultQuestionTypes = [
  "true_false",
  "multiple_choice",
  "matching",
  "written",
] as const satisfies QuestionType[];

export function distributeQuestions(
  questionCount: number,
  selectedQuestionTypes: QuestionType[]
): QuestionType[] {
  const enabledQuestionTypes =
    selectedQuestionTypes.length > 0
      ? selectedQuestionTypes
      : [...defaultQuestionTypes];

  if (questionCount <= 0) {
    return [];
  }

  const assignments: QuestionType[] = [];

  for (let index = 0; index < questionCount; index += 1) {
    const questionType =
      enabledQuestionTypes[index % enabledQuestionTypes.length];

    if (!questionType) {
      continue;
    }

    assignments.push(questionType);
  }

  return assignments;
}
