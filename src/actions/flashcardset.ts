"use server";

import { updateTag } from "next/cache";
import { auth } from "@/auth";
import { getUserLibraryCacheTag } from "@/lib/user-library";
import { db } from "@/server/db";

export const deleteFlashcardSet = async (setId: string) => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to delete a flashcard set.");
  }

  await db.flashcardSet.delete({
    where: {
      id: setId,
    },
  });

  updateTag(getUserLibraryCacheTag(userId));
};
