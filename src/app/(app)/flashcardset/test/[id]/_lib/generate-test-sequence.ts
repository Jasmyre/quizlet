import type { Flashcard, TestSlide, TestSlideType } from "./types";

const orderedSlideTypes: TestSlideType[] = [
  "TrueFalse",
  "MultipleChoice",
  "Written",
  "Matching",
];

const orderedRemainderTypes: TestSlideType[] = ["TrueFalse", "MultipleChoice"];

export function generateTestSequence(
  allCards: Flashcard[],
  selectedTypes: string[]
): TestSlide[] {
  const enabledTypes = getEnabledTypes(selectedTypes);

  if (allCards.length === 0 || enabledTypes.length === 0) {
    return [];
  }

  const itemsPerType = Math.floor(allCards.length / enabledTypes.length);
  const buckets = createBuckets();
  const nextCardIndex = fillBaseBuckets({
    allCards,
    buckets,
    enabledTypes,
    itemsPerType,
  });

  distributeRemainder({
    allCards,
    buckets,
    enabledTypes,
    nextCardIndex,
  });

  return buildSlides(buckets, enabledTypes);
}

function getEnabledTypes(selectedTypes: string[]): TestSlideType[] {
  return orderedSlideTypes.filter((type) =>
    selectedTypes.some((candidate) => normalizeType(candidate) === type)
  );
}

function createBuckets(): Record<TestSlideType, Flashcard[]> {
  return {
    TrueFalse: [],
    MultipleChoice: [],
    Written: [],
    Matching: [],
  };
}

function fillBaseBuckets({
  allCards,
  buckets,
  enabledTypes,
  itemsPerType,
}: {
  allCards: Flashcard[];
  buckets: Record<TestSlideType, Flashcard[]>;
  enabledTypes: TestSlideType[];
  itemsPerType: number;
}): number {
  let nextCardIndex = 0;

  for (const type of enabledTypes) {
    if (type === "Matching") {
      nextCardIndex = fillBucket({
        allCards,
        bucket: buckets.Matching,
        nextCardIndex,
        itemCount: itemsPerType,
      });
      continue;
    }

    nextCardIndex = fillBucket({
      allCards,
      bucket: buckets[type],
      nextCardIndex,
      itemCount: itemsPerType,
    });
  }

  return nextCardIndex;
}

function distributeRemainder({
  allCards,
  buckets,
  enabledTypes,
  nextCardIndex,
}: {
  allCards: Flashcard[];
  buckets: Record<TestSlideType, Flashcard[]>;
  enabledTypes: TestSlideType[];
  nextCardIndex: number;
}): void {
  const remainderCount = allCards.length - nextCardIndex;
  const remainderTargets = getRemainderTargets(enabledTypes);

  for (let index = 0; index < remainderCount; index += 1) {
    const card = allCards[nextCardIndex + index];
    const targetType = remainderTargets[index % remainderTargets.length];

    if (card === undefined || targetType === undefined) {
      continue;
    }

    buckets[targetType].push(card);
  }
}

function fillBucket({
  allCards,
  bucket,
  nextCardIndex,
  itemCount,
}: {
  allCards: Flashcard[];
  bucket: Flashcard[];
  nextCardIndex: number;
  itemCount: number;
}): number {
  let currentIndex = nextCardIndex;

  for (let index = 0; index < itemCount; index += 1) {
    const card = allCards[currentIndex];

    if (card === undefined) {
      break;
    }

    bucket.push(card);
    currentIndex += 1;
  }

  return currentIndex;
}

function buildSlides(
  buckets: Record<TestSlideType, Flashcard[]>,
  enabledTypes: TestSlideType[]
): TestSlide[] {
  const slides: TestSlide[] = [];

  for (const type of orderedSlideTypes) {
    if (!enabledTypes.includes(type)) {
      continue;
    }

    if (type === "Matching") {
      if (buckets.Matching.length > 0) {
        slides.push({
          batch: buckets.Matching,
          type,
        });
      }

      continue;
    }

    for (const card of buckets[type]) {
      slides.push({
        question: card,
        type,
      });
    }
  }

  return slides;
}

function getRemainderTargets(enabledTypes: TestSlideType[]): TestSlideType[] {
  const availableRemainderTypes = orderedRemainderTypes.filter((type) =>
    enabledTypes.includes(type)
  );

  if (availableRemainderTypes.length > 0) {
    return availableRemainderTypes;
  }

  const fallbackType = enabledTypes.find((type) => type !== "Matching");

  return fallbackType === undefined ? ["Matching"] : [fallbackType];
}

function normalizeType(value: string): TestSlideType | null {
  const normalizedValue = value.trim();

  switch (normalizedValue) {
    case "true_false":
    case "TrueFalse":
      return "TrueFalse";
    case "multiple_choice":
    case "MultipleChoice":
      return "MultipleChoice";
    case "written":
    case "Written":
      return "Written";
    case "matching":
    case "Matching":
      return "Matching";
    default:
      return null;
  }
}
