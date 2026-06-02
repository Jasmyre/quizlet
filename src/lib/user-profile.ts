import "server-only";

import {
  type UserProfile,
  userProfileSchema,
} from "@/schemas/user-profile-schema";
import { db } from "@/server/db";

interface GetUserProfileInput {
  usernameOrId: string;
  viewerUserId?: string | null;
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
});

const sectionDateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});

const getJoinedAtLabel = (date: Date): string =>
  `Joined ${dateFormatter.format(date)}`;

const getSectionLabel = (date: Date, referenceDate = new Date()): string => {
  const isCurrentMonth =
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth();

  if (isCurrentMonth) {
    return "This month";
  }

  return `In ${sectionDateFormatter.format(date)}`;
};

export const getUserProfile = async ({
  usernameOrId,
  viewerUserId = null,
}: GetUserProfileInput): Promise<UserProfile | null> => {
  const user = await db.user.findFirst({
    where: {
      OR: [{ id: usernameOrId }, { username: usernameOrId }],
    },
    select: {
      biography: true,
      createdAt: true,
      flashcardSets: {
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          _count: {
            select: {
              flashcards: true,
            },
          },
          createdAt: true,
          description: true,
          id: true,
          title: true,
          updatedAt: true,
          userId: true,
          visibility: true,
        },
      },
      id: true,
      image: true,
      isPrivate: true,
      name: true,
      username: true,
    },
  });

  if (!user) {
    return null;
  }

  const isOwnProfile = user.id === viewerUserId;

  if (user.isPrivate && !isOwnProfile) {
    return null;
  }

  const visibleFlashcardSets = isOwnProfile
    ? user.flashcardSets
    : user.flashcardSets.filter((set) => set.visibility === "PUBLIC");

  const cardCount = visibleFlashcardSets.reduce(
    (total, set) => total + set._count.flashcards,
    0
  );

  return userProfileSchema.parse({
    avatarUrl: user.image ?? undefined,
    bio: user.biography ?? undefined,
    classes: [],
    flashcardSets: visibleFlashcardSets.map((set) => ({
      avgScore: 0,
      createdAt: set.createdAt.toISOString(),
      description: set.description,
      flashcardCount: set._count.flashcards,
      id: set.id,
      practiceCount: 0,
      sectionLabel: getSectionLabel(set.createdAt),
      studiedAtOrder: set.updatedAt.getTime(),
      title: set.title,
      updatedAt: set.updatedAt.toISOString(),
      userId: set.userId,
      visibility: set.visibility,
    })),
    folders: [],
    id: user.id,
    joinedAt: getJoinedAtLabel(user.createdAt),
    name: user.name,
    stats: {
      cards: cardCount,
      classes: 0,
      folders: 0,
      friends: 0,
      sets: visibleFlashcardSets.length,
    },
    username: user.username ?? user.name,
  });
};
