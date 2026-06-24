// Depends on the shuffled flashcard deck, prompt-mode setting, and shared flashcard test types.
import { distributeQuestions } from "./distribute-questions";
import { normalizeAnswer } from "./normalize-answer";
import { shuffle } from "./shuffle";
import type {
  Flashcard,
  MatchingChoice,
  MatchingSlot,
  PromptMode,
  QuestionType,
  TestConfig,
  TestQuestion,
} from "./types";

interface QuestionSource {
  config: TestConfig;
  flashcards: Flashcard[];
}

interface PromptVariant {
  answerSide: "term" | "definition";
  answerText: string;
  promptText: string;
}

export function buildQuestionBank({
  config,
  flashcards,
}: QuestionSource): TestQuestion[] {
  if (flashcards.length === 0 || config.questionCount <= 0) {
    return [];
  }

  const deck = shuffle([...flashcards]);
  const questionTypes = distributeQuestions(
    config.questionCount,
    config.selectedQuestionTypes
  );

  return questionTypes.map((type, index) => {
    const flashcard = deck[index % deck.length];

    if (!flashcard) {
      return buildWrittenQuestion({
        config,
        flashcard: deck[0] ?? flashcards[0] ?? fallbackFlashcard(),
        index,
      });
    }

    if (type === "matching") {
      return buildMatchingQuestion({
        config,
        deck,
        index,
      });
    }

    return buildSingleQuestion({
      config,
      flashcard,
      index,
      deck,
      type,
    });
  });
}

function buildSingleQuestion({
  config,
  flashcard,
  index,
  deck,
  type,
}: {
  config: TestConfig;
  flashcard: Flashcard;
  index: number;
  deck: Flashcard[];
  type: Exclude<QuestionType, "matching">;
}): TestQuestion {
  const promptVariant = resolvePromptVariant(flashcard, config.promptMode);
  const correctAnswerText = promptVariant.answerText;

  switch (type) {
    case "true_false": {
      const isTrue = Math.random() >= 0.5;

      return {
        correctAnswer: isTrue,
        correctAnswerText,
        flashcardIds: [flashcard.id],
        headerText: promptVariant.promptText,
        id: `question-${flashcard.id}-tf-${index}`,
        promptMode: config.promptMode,
        statementText: buildTrueFalseStatement({
          answerSide: promptVariant.answerSide,
          correctAnswerText,
          deck,
          isTrue,
        }),
        type: "true_false",
      };
    }
    case "multiple_choice": {
      const choices = buildMultipleChoiceChoices({
        answerSide: promptVariant.answerSide,
        correctAnswerText,
        deck,
      });

      return {
        choices,
        correctAnswer: correctAnswerText,
        correctAnswerText,
        flashcardIds: [flashcard.id],
        headerText: promptVariant.promptText,
        id: `question-${flashcard.id}-mc-${index}`,
        promptMode: config.promptMode,
        type: "multiple_choice",
      };
    }
    case "written":
      return buildWrittenQuestion({ config, flashcard, index });
    default:
      throw new Error(`Unsupported question type: ${type}`);
  }
}

function buildWrittenQuestion({
  config,
  flashcard,
  index,
}: {
  config: TestConfig;
  flashcard: Flashcard;
  index: number;
}): TestQuestion {
  const promptVariant = resolvePromptVariant(flashcard, config.promptMode);

  return {
    acceptedAnswers: [promptVariant.answerText],
    correctAnswer: promptVariant.answerText,
    correctAnswerText: promptVariant.answerText,
    flashcardIds: [flashcard.id],
    headerText: promptVariant.promptText,
    id: `question-${flashcard.id}-written-${index}`,
    promptMode: config.promptMode,
    type: "written",
  };
}

function buildMatchingQuestion({
  config,
  deck,
  index,
}: {
  config: TestConfig;
  deck: Flashcard[];
  index: number;
}): TestQuestion {
  const cards = collectMatchingCards(deck, index);

  const slots: MatchingSlot[] = cards.map((card, slotIndex) => {
    const promptVariant = resolvePromptVariant(card, config.promptMode);
    const slotId = `question-${index}-slot-${slotIndex + 1}`;

    return {
      answerId: card.id,
      answerText: promptVariant.answerText,
      id: slotId,
      promptText: promptVariant.promptText,
    };
  });

  const answerBank: MatchingChoice[] = shuffle(
    slots.map((slot) => ({
      id: slot.answerId,
      text: slot.answerText,
    }))
  );

  const correctAnswer = Object.fromEntries(
    slots.map((slot) => [slot.id, slot.answerId])
  );

  return {
    answerBank,
    correctAnswer,
    correctAnswerText: slots.map((slot) => slot.answerText).join(" · "),
    flashcardIds: cards.map((card) => card.id),
    headerText:
      slots[0]?.promptText ?? cards[0]?.term ?? cards[0]?.definition ?? "",
    id: `question-${index}-matching`,
    promptMode: config.promptMode,
    slots,
    type: "matching",
  };
}

function buildMultipleChoiceChoices({
  answerSide,
  correctAnswerText,
  deck,
}: {
  answerSide: PromptVariant["answerSide"];
  correctAnswerText: string;
  deck: Flashcard[];
}): string[] {
  const pool = deck
    .map((card) => getAnswerSideText(card, answerSide))
    .filter(
      (candidate) =>
        normalizeAnswer(candidate) !== normalizeAnswer(correctAnswerText)
    );
  const uniquePool = Array.from(new Set(pool));
  const distractors = shuffle(uniquePool).slice(0, 3);

  return shuffle([correctAnswerText, ...distractors]);
}

function collectMatchingCards(
  deck: Flashcard[],
  startIndex: number
): Flashcard[] {
  const cards: Flashcard[] = [];

  for (let offset = 0; offset < 4; offset += 1) {
    const card = deck[(startIndex + offset) % deck.length];

    if (card) {
      cards.push(card);
    }
  }

  while (cards.length < 4) {
    const fallbackCard = deck[cards.length % deck.length];

    if (!fallbackCard) {
      break;
    }

    cards.push(fallbackCard);
  }

  return cards;
}

function resolvePromptVariant(
  flashcard: Flashcard,
  promptMode: PromptMode
): PromptVariant {
  if (promptMode === "term") {
    return {
      answerSide: "definition",
      answerText: flashcard.definition,
      promptText: flashcard.term,
    };
  }

  if (promptMode === "definition") {
    return {
      answerSide: "term",
      answerText: flashcard.term,
      promptText: flashcard.definition,
    };
  }

  if (Math.random() >= 0.5) {
    return {
      answerSide: "definition",
      answerText: flashcard.definition,
      promptText: flashcard.term,
    };
  }

  return {
    answerSide: "term",
    answerText: flashcard.term,
    promptText: flashcard.definition,
  };
}

function getAnswerSideText(
  flashcard: Flashcard,
  answerSide: PromptVariant["answerSide"]
): string {
  return answerSide === "term" ? flashcard.term : flashcard.definition;
}

function buildTrueFalseStatement({
  answerSide,
  correctAnswerText,
  deck,
  isTrue,
}: {
  answerSide: PromptVariant["answerSide"];
  correctAnswerText: string;
  deck: Flashcard[];
  isTrue: boolean;
}): string {
  if (isTrue) {
    return correctAnswerText;
  }

  const distractor = pickDistractorAnswerText({
    answerSide,
    correctAnswerText,
    deck,
  });

  return distractor ?? correctAnswerText;
}

function pickDistractorAnswerText({
  answerSide,
  correctAnswerText,
  deck,
}: {
  answerSide: PromptVariant["answerSide"];
  correctAnswerText: string;
  deck: Flashcard[];
}): string | null {
  const pool = deck
    .map((card) => getAnswerSideText(card, answerSide))
    .filter(
      (candidate) =>
        normalizeAnswer(candidate) !== normalizeAnswer(correctAnswerText)
    );

  const uniquePool = Array.from(new Set(pool));
  const shuffledPool = shuffle(uniquePool);

  return shuffledPool[0] ?? null;
}

function fallbackFlashcard(): Flashcard {
  return {
    id: "fallback-card",
    definition: "Fallback definition",
    term: "Fallback term",
  };
}
