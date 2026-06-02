import z from "zod";
import { flashcardSetVisibilityValues } from "@/lib/flashcard-set-visibility";

export const userLibraryFlashcardSetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  visibility: z.enum(flashcardSetVisibilityValues),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  flashcardCount: z.number().int().nonnegative(),
});

export const userLibraryFolderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  setCount: z.number().int().nonnegative(),
});

export const userLibraryClassSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  memberCount: z.number().int().nonnegative(),
  setCount: z.number().int().nonnegative(),
  role: z.enum(["owner", "member"]),
});

export const userLibrarySchema = z.object({
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    username: z.string().min(1),
  }),
  stats: z.object({
    flashcardSets: z.number().int().nonnegative(),
    folders: z.number().int().nonnegative(),
    classes: z.number().int().nonnegative(),
  }),
  flashcardSets: z.array(userLibraryFlashcardSetSchema),
  folders: z.array(userLibraryFolderSchema),
  classes: z.array(userLibraryClassSchema),
});

export type UserLibrary = z.infer<typeof userLibrarySchema>;
