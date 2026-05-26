import z from "zod";

export const userProfileStudySetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sectionLabel: z.string().min(1),
  subject: z.string().min(1),
  visibility: z.enum(["public", "private", "unlisted"]),
  terms: z.number().int().nonnegative(),
  lastStudied: z.string().min(1),
  studiedAtOrder: z.number().int(),
  avgScore: z.number().int().min(0).max(100),
  practiceCount: z.number().int().nonnegative(),
});

export const userProfileFolderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  setCount: z.number().int().nonnegative(),
});

export const userProfileClassSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  memberCount: z.number().int().nonnegative(),
  setCount: z.number().int().nonnegative(),
});

export const userProfileSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  name: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  joinedAt: z.string().min(1),
  stats: z.object({
    sets: z.number().int().nonnegative(),
    cards: z.number().int().nonnegative(),
    classes: z.number().int().nonnegative(),
    folders: z.number().int().nonnegative(),
    friends: z.number().int().nonnegative(),
  }),
  studySets: z.array(userProfileStudySetSchema),
  classes: z.array(userProfileClassSchema),
  folders: z.array(userProfileFolderSchema),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
