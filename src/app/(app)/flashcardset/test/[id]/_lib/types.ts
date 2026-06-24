// Depends on the test engine, question components, and scoring helpers that all share this flashcard test contract.
export type QuestionType =
  | "true_false"
  | "multiple_choice"
  | "matching"
  | "written";

export type TestSlideType =
  | "TrueFalse"
  | "MultipleChoice"
  | "Written"
  | "Matching";

export type PromptMode = "term" | "definition" | "both";

export type MatchingAssignments = Record<string, string>;

export type TestAnswer = boolean | string | MatchingAssignments;

export interface Flashcard {
  definition: string;
  id: string;
  term: string;
}

export interface TestConfig {
  allowBackNavigation: boolean;
  instantResponse: boolean;
  promptMode: PromptMode;
  questionCount: number;
  selectedQuestionTypes: QuestionType[];
}

export interface MatchingSlot {
  answerId: string;
  answerText: string;
  id: string;
  promptText: string;
}

export interface MatchingChoice {
  id: string;
  text: string;
}

interface QuestionBase {
  flashcardIds: string[];
  headerText: string;
  id: string;
  pointWeight?: number;
  promptMode: PromptMode;
}

export interface TrueFalseQuestion extends QuestionBase {
  correctAnswer: boolean;
  correctAnswerText: string;
  statementText: string;
  type: "true_false";
}

export interface MultipleChoiceQuestion extends QuestionBase {
  choices: string[];
  correctAnswer: string;
  correctAnswerText: string;
  type: "multiple_choice";
}

export interface MatchingQuestion extends QuestionBase {
  answerBank: MatchingChoice[];
  batch: Flashcard[];
  correctAnswer: MatchingAssignments;
  correctAnswerText: string;
  slots: MatchingSlot[];
  type: "matching";
}

export interface WrittenQuestion extends QuestionBase {
  acceptedAnswers: string[];
  correctAnswer: string;
  correctAnswerText: string;
  type: "written";
}

export type TestQuestion =
  | TrueFalseQuestion
  | MultipleChoiceQuestion
  | MatchingQuestion
  | WrittenQuestion;

export type TestSlide =
  | {
      question: Flashcard;
      type: "TrueFalse";
    }
  | {
      question: Flashcard;
      type: "MultipleChoice";
    }
  | {
      question: Flashcard;
      type: "Written";
    }
  | {
      batch: Flashcard[];
      type: "Matching";
    };

export interface TestResponseRecord {
  answeredAt: string;
  flashcardIds: string[];
  questionId: string;
  type: QuestionType;
  userResponse: TestAnswer;
}

export interface TestResponse extends TestResponseRecord {
  correctAnswerText: string;
  earnedPoints: number;
  possiblePoints: number;
  wasCorrect: boolean;
}

export interface TestSlideResponseRecord {
  answeredAt: string;
  earnedPoints: number;
  flashcardIds: string[];
  possiblePoints: number;
  slideId: string;
  type: TestSlideType;
  userResponse: TestAnswer;
  wasCorrect: boolean;
}

export interface TestSessionSummary {
  correctCount: number;
  correctPoints: number;
  responses: TestResponse[];
  scorePercent: number;
  timeTakenMs: number;
  totalPoints: number;
  totalQuestions: number;
  totalSlides: number;
}

export interface TestFeedback {
  correctAnswerText: string;
  userResponse: TestAnswer;
  wasCorrect: boolean;
}
