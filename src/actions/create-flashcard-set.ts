"use server";

import type * as z from "zod";
import { auth } from "@/auth";
import { createFlashcardSetSchema } from "@/schemas/flashcard-set-schema";
import { db } from "@/server/db";

type CreateFlashcardSetValues = z.infer<typeof createFlashcardSetSchema>;
type CreateFlashcardSetResult =
  | {
      success: string;
      flashcardSetId: string;
      error?: undefined;
    }
  | {
      error: string;
      success?: undefined;
      flashcardSetId?: undefined;
    };

const flashcardSetVisibilityByFormValue = {
  public: "PUBLIC",
} as const satisfies Record<CreateFlashcardSetValues["visibility"], "PUBLIC">;

export const createFlashcardSet = async (
  values: CreateFlashcardSetValues
): Promise<CreateFlashcardSetResult> => {
  const validatedFields = createFlashcardSetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid flashcard set fields!" };
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "You must be signed in to create a flashcard set." };
  }

  const { title, description, visibility, cards } = validatedFields.data;
  const normalizedDescription = description?.trim() || null;

  try {
    const flashcardSet = await db.flashcardSet.create({
      data: {
        title,
        description: normalizedDescription,
        visibility: flashcardSetVisibilityByFormValue[visibility],
        userId,
        flashcards: {
          create: cards.map(({ term, definition }) => ({
            term,
            definition,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    return {
      success: "Flashcard set created.",
      flashcardSetId: flashcardSet.id,
    };
  } catch(e) {
    console.error("Error creating flashcard set:", e);
    return { error: "Unable to create flashcard set. Please try again." };
  }
};
