import z from "zod";

const flashcardSchema = z.object({
  term: z
    .string()
    .trim()
    .min(1, "Term is required")
    .max(120, "Term must be at most 120 characters long"),
  definition: z
    .string()
    .trim()
    .min(1, "Definition is required")
    .max(500, "Definition must be at most 500 characters long"),
});

export const createFlashcardSetSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be at most 120 characters long"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters long")
    .optional(),
  visibility: z.literal("public"),
  intent: z.enum(["create", "practice"]),
  cards: z
    .array(flashcardSchema)
    .min(2, "Add at least two flashcards to create a set"),
});
