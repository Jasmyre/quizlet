"use server";

import type * as z from "zod";
import { createFlashcardSetSchema } from "@/schemas/flashcard-set-schema";

type CreateFlashcardSetValues = z.infer<typeof createFlashcardSetSchema>;

export const createFlashcardSet = async (
  values: CreateFlashcardSetValues
): Promise<
  | {
      success: string;
      error?: undefined;
    }
  | {
      error: string;
      success?: undefined;
    }
> => {
  const validatedFields = createFlashcardSetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid flashcard set fields!" };
  }

  console.log("create-flashcard-set", validatedFields.data);
  await Promise.resolve();

  return { success: "Flashcard set data logged." };
};
