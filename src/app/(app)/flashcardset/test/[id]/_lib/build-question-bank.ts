import { distributeQuestions } from "./distribute-questions";
import { shuffle } from "./shuffle";
import type {
  AnswerWith,
  Flashcard,
  MatchingChoice,
  TestConfig,
  TestQuestion,
} from "./types";

interface QuestionSource {
  answerWith: AnswerWith;
  config: TestConfig;
  flashcards: Flashcard[];
}

const matchingChoiceKeys = ["A", "B", "C", "D"] as const;

export function buildQuestionBank({
  answerWith,
  flashcards,
  config,
}: QuestionSource): TestQuestion[] {
  const availableFlashcards = shuffle(flashcards).slice(
    0,
    Math.min(config.questionCount, flashcards.length)
  );
  const questionTypes = distributeQuestions(
    availableFlashcards.length,
    config.selectedQuestionTypes
  );

  return availableFlashcards.map((flashcard, index) =>
    buildQuestion({
      answerWith,
      card: flashcard,
      distractorPool: flashcards,
      index,
      type: questionTypes[index] ?? "written",
    })
  );
}

function buildQuestion({
  answerWith,
  card,
  distractorPool,
  index,
  type,
}: {
  answerWith: AnswerWith;
  card: Flashcard;
  distractorPool: Flashcard[];
  index: number;
  type: TestQuestion["type"];
}): TestQuestion {
  const answerText = answerWith === "term" ? card.term : card.definition;
  const promptText =
    answerWith === "term"
      ? "What term matches this definition?"
      : "What definition matches this term?";

  switch (type) {
    case "true_false": {
      const shouldBeTrue = Math.random() >= 0.5;
      const candidate = shouldBeTrue
        ? answerText
        : pickDistractorAnswer(answerWith, card.id, distractorPool);
      const prompt =
        answerWith === "term"
          ? `True or false: The definition "${card.definition}" describes "${candidate}".`
          : `True or false: The term "${card.term}" means "${candidate}".`;

      return {
        id: `question-${card.id}-tf-${index}`,
        flashcardId: card.id,
        type,
        prompt,
        correctAnswer: shouldBeTrue,
        correctAnswerText: answerText,
      };
    }
    case "multiple_choice": {
      const distractors = pickDistractorAnswers(
        answerWith,
        card.id,
        distractorPool,
        3
      );
      const choices = shuffle([answerText, ...distractors]);

      return {
        id: `question-${card.id}-mc-${index}`,
        flashcardId: card.id,
        type,
        prompt: promptText,
        correctAnswer: answerText,
        correctAnswerText: answerText,
        choices,
      };
    }
    case "matching": {
      const distractors = pickDistractorAnswers(
        answerWith,
        card.id,
        distractorPool,
        3
      );
      const shuffledChoices = shuffle([answerText, ...distractors]);
      const matchingChoices = shuffledChoices.map((text, choiceIndex) => ({
        key: matchingChoiceKeys[choiceIndex] ?? "A",
        text,
      })) satisfies MatchingChoice[];
      const correctChoice = matchingChoices.find(
        (choice) => choice.text === answerText
      );

      return {
        id: `question-${card.id}-match-${index}`,
        flashcardId: card.id,
        type,
        prompt:
          answerWith === "term"
            ? "Match the definition to the correct term."
            : "Match the term to the correct definition.",
        correctAnswer: correctChoice?.key ?? "A",
        correctAnswerText: answerText,
        matchingChoices,
      };
    }
    case "written":
      return {
        id: `question-${card.id}-written-${index}`,
        flashcardId: card.id,
        type,
        prompt: promptText,
        correctAnswer: answerText,
        correctAnswerText: answerText,
        acceptedAnswers: [answerText],
      };
    default:
      return {
        id: `question-${card.id}-written-${index}`,
        flashcardId: card.id,
        type: "written",
        prompt: promptText,
        correctAnswer: answerText,
        correctAnswerText: answerText,
        acceptedAnswers: [answerText],
      };
  }
}

function pickDistractorAnswers(
  answerWith: AnswerWith,
  cardId: string,
  pool: Flashcard[],
  count: number
): string[] {
  const answers = pool
    .filter((card) => card.id !== cardId)
    .map((card) => (answerWith === "term" ? card.term : card.definition));

  return shuffle(answers).slice(0, count);
}

function pickDistractorAnswer(
  answerWith: AnswerWith,
  cardId: string,
  pool: Flashcard[]
): string {
  return pickDistractorAnswers(answerWith, cardId, pool, 1)[0] ?? "";
}
