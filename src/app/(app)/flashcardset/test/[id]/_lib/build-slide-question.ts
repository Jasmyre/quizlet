import { normalizeAnswer } from "./normalize-answer";
import { shuffle } from "./shuffle";
import type {
  Flashcard,
  MatchingChoice,
  MatchingQuestion,
  MatchingSlot,
  PromptMode,
  TestConfig,
  TestQuestion,
  TestSlide,
} from "./types";

export function buildSlideQuestion({
  allCards,
  config,
  slide,
  slideIndex,
}: {
  allCards: Flashcard[];
  config: TestConfig;
  slide: Extract<
    TestSlide,
    { type: "TrueFalse" | "MultipleChoice" | "Written" }
  >;
  slideIndex: number;
}): TestQuestion {
  const flashcard = slide.question;
  const promptVariant = resolvePromptVariant(flashcard, config.promptMode);
  const correctAnswerText = promptVariant.answerText;

  switch (slide.type) {
    case "TrueFalse": {
      const isTrue = Math.random() >= 0.5;

      return {
        correctAnswer: isTrue,
        correctAnswerText,
        flashcardIds: [flashcard.id],
        headerText: promptVariant.promptText,
        id: `slide-${slideIndex}-${flashcard.id}-tf`,
        promptMode: config.promptMode,
        statementText: buildTrueFalseStatement({
          answerSide: promptVariant.answerSide,
          correctAnswerText,
          deck: allCards,
          isTrue,
        }),
        type: "true_false",
      };
    }
    case "MultipleChoice": {
      const choices = buildMultipleChoiceChoices({
        answerSide: promptVariant.answerSide,
        correctAnswerText,
        deck: allCards,
      });

      return {
        choices,
        correctAnswer: correctAnswerText,
        correctAnswerText,
        flashcardIds: [flashcard.id],
        headerText: promptVariant.promptText,
        id: `slide-${slideIndex}-${flashcard.id}-mc`,
        promptMode: config.promptMode,
        type: "multiple_choice",
      };
    }
    case "Written":
      return {
        acceptedAnswers: [promptVariant.answerText],
        correctAnswer: promptVariant.answerText,
        correctAnswerText: promptVariant.answerText,
        flashcardIds: [flashcard.id],
        headerText: promptVariant.promptText,
        id: `slide-${slideIndex}-${flashcard.id}-written`,
        promptMode: config.promptMode,
        type: "written",
      };
    default:
      throw new Error("Unsupported slide type");
  }
}

export function buildMatchingSlideQuestion({
  batch,
  config,
  slideIndex,
}: {
  batch: Flashcard[];
  config: TestConfig;
  slideIndex: number;
}): MatchingQuestion {
  const slots: MatchingSlot[] = batch.map((card, slotIndex) => {
    const promptVariant = resolvePromptVariant(card, config.promptMode);
    const slotId = `slide-${slideIndex}-slot-${slotIndex + 1}`;

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
    batch,
    correctAnswer,
    correctAnswerText: slots.map((slot) => slot.answerText).join(" · "),
    flashcardIds: batch.map((card) => card.id),
    headerText:
      slots[0]?.promptText ?? batch[0]?.term ?? batch[0]?.definition ?? "",
    id: `slide-${slideIndex}-matching`,
    promptMode: config.promptMode,
    pointWeight: batch.length,
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

interface PromptVariant {
  answerSide: "term" | "definition";
  answerText: string;
  promptText: string;
}
