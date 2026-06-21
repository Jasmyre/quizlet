import z from "zod";
import { flashcardSetVisibilityValues } from "@/lib/flashcard-set-visibility";

export const flashcardSetDetailCardSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const flashcardSetDetailSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  visibility: z.enum(flashcardSetVisibilityValues),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    username: z.string().min(1),
  }),
  flashcards: z.array(flashcardSetDetailCardSchema),
});

export type FlashcardSetDetail = z.infer<typeof flashcardSetDetailSchema>;
