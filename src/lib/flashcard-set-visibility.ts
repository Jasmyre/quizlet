import { FlashcardSetVisibility as prismaFlashcardSetVisibilityEnum } from "@prisma/client";

export const flashcardSetVisibilityValues = [
  prismaFlashcardSetVisibilityEnum.PUBLIC,
  prismaFlashcardSetVisibilityEnum.PRIVATE,
] as const;

export type FlashcardSetVisibility =
  (typeof flashcardSetVisibilityValues)[number];

export const flashcardSetVisibilityLabels = {
  [prismaFlashcardSetVisibilityEnum.PRIVATE]: "Private",
  [prismaFlashcardSetVisibilityEnum.PUBLIC]: "Public",
} as const satisfies Record<FlashcardSetVisibility, string>;

export const flashcardSetVisibilityFormValues = ["public", "private"] as const;

export type FlashcardSetVisibilityFormValue =
  (typeof flashcardSetVisibilityFormValues)[number];

export const flashcardSetVisibilityByFormValue = {
  private: prismaFlashcardSetVisibilityEnum.PRIVATE,
  public: prismaFlashcardSetVisibilityEnum.PUBLIC,
} as const satisfies Record<
  FlashcardSetVisibilityFormValue,
  FlashcardSetVisibility
>;
