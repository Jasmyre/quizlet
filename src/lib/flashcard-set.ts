import "server-only";

import type { FlashcardSetDetail } from "@/schemas/flashcard-set-detail-schema";
import { flashcardSetDetailSchema } from "@/schemas/flashcard-set-detail-schema";
import { db } from "@/server/db";

interface GetFlashcardSetInput {
  id: string;
  viewerUserId?: string | null;
}

export const getFlashcardSet = async ({
  id,
  viewerUserId = null,
}: GetFlashcardSetInput): Promise<FlashcardSetDetail | null> => {
  const flashcardSet = await db.flashcardSet.findUnique({
    where: {
      id,
    },
    select: {
      createdAt: true,
      description: true,
      flashcards: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          createdAt: true,
          definition: true,
          id: true,
          term: true,
          updatedAt: true,
        },
      },
      id: true,
      title: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      userId: true,
      visibility: true,
    },
  });

  if (!flashcardSet) {
    return null;
  }

  const isOwner = flashcardSet.userId === viewerUserId;

  if (flashcardSet.visibility === "PRIVATE" && !isOwner) {
    return null;
  }

  return flashcardSetDetailSchema.parse({
    createdAt: flashcardSet.createdAt.toISOString(),
    description: flashcardSet.description,
    flashcards: flashcardSet.flashcards.map((card) => ({
      createdAt: card.createdAt.toISOString(),
      definition: card.definition,
      id: card.id,
      term: card.term,
      updatedAt: card.updatedAt.toISOString(),
    })),
    id: flashcardSet.id,
    title: flashcardSet.title,
    updatedAt: flashcardSet.updatedAt.toISOString(),
    user: {
      id: flashcardSet.user.id,
      name: flashcardSet.user.name,
      username: flashcardSet.user.username ?? flashcardSet.user.name,
    },
    visibility: flashcardSet.visibility,
  });
};
