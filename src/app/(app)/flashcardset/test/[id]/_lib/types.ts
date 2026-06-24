export type QuestionType =
  | "true_false"
  | "multiple_choice"
  | "matching"
  | "written";

export type AnswerWith = "term" | "definition";

export type TestAnswer = boolean | string;

export interface Flashcard {
  definition: string;
  hint?: string;
  id: string;
  tags?: string[];
  term: string;
}

export interface TestConfig {
  allowBackNavigation: boolean;
  answerWith: AnswerWith;
  instantResponse: boolean;
  questionCount: number;
  selectedQuestionTypes: QuestionType[];
}

export interface MatchingChoice {
  key: string;
  text: string;
}

export interface TestQuestion {
  acceptedAnswers?: string[];
  choices?: string[];
  correctAnswer: TestAnswer;
  correctAnswerText: string;
  flashcardId: string;
  id: string;
  matchingChoices?: MatchingChoice[];
  prompt: string;
  type: QuestionType;
}

export interface TestResponseRecord {
  answeredAt: string;
  flashcardId: string;
  questionId: string;
  type: QuestionType;
  userResponse: TestAnswer;
}

export interface TestResponse extends TestResponseRecord {
  correctAnswerText: string;
  wasCorrect: boolean;
}

export interface TestSessionSummary {
  correctCount: number;
  responses: TestResponse[];
  scorePercent: number;
  timeTakenMs: number;
  totalQuestions: number;
}

export interface TestFeedback {
  correctAnswerText: string;
  userResponse: TestAnswer;
  wasCorrect: boolean;
}
