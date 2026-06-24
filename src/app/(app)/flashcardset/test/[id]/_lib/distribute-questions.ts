// Depends on the available test types and the shuffled deck order produced by the client engine.
import type { QuestionType } from "./types";

export function distributeQuestions(
  questionCount: number,
  selectedQuestionTypes: QuestionType[]
): QuestionType[] {
  const enabledQuestionTypes =
    selectedQuestionTypes.length > 0
      ? selectedQuestionTypes
      : [
          "true_false",
          "multiple_choice",
          "matching",
          "written",
        ];

  if (questionCount <= 0) {
    return [];
  }

  const assignments: QuestionType[] = [];

  for (let index = 0; index < questionCount; index += 1) {
    const questionType =
      enabledQuestionTypes[index % enabledQuestionTypes.length];

    if (questionType) {
      assignments.push(questionType);
    }
  }

  return assignments;
}
