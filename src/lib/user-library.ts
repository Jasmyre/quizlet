import "server-only";

import { cacheTag } from "next/cache";
import {
  type UserLibrary,
  userLibrarySchema,
} from "@/schemas/user-library-schema";
import { db } from "@/server/db";

export const getUserLibraryCacheTag = (userId: string): string =>
  `user-library-${userId}`;

export const getUserLibrary = async (userId: string): Promise<UserLibrary> => {
  "use cache";

  cacheTag(getUserLibraryCacheTag(userId));

  const [user, flashcardSets, folders, classrooms] = await Promise.all([
    db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        username: true,
      },
    }),
    db.flashcardSet.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        userId,
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
        visibility: true,
      },
    }),
    db.folder.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        ownerId: userId,
      },
      select: {
        _count: {
          select: {
            flashcardSets: true,
          },
        },
        createdAt: true,
        description: true,
        id: true,
        name: true,
        updatedAt: true,
      },
    }),
    db.classroom.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      where: {
        OR: [
          {
            ownerId: userId,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        _count: {
          select: {
            flashcardSets: true,
            members: true,
          },
        },
        createdAt: true,
        description: true,
        id: true,
        name: true,
        ownerId: true,
        updatedAt: true,
      },
    }),
  ]);

  if (!user) {
    throw new Error("User library owner does not exist.");
  }

  return userLibrarySchema.parse({
    user: {
      id: user.id,
      name: user.name,
      username: user.username ?? user.name,
    },
    stats: {
      classes: classrooms.length,
      flashcardSets: flashcardSets.length,
      folders: folders.length,
    },
    classes: classrooms.map((classroom) => ({
      createdAt: classroom.createdAt.toISOString(),
      description: classroom.description,
      id: classroom.id,
      memberCount: classroom._count.members,
      name: classroom.name,
      role: classroom.ownerId === userId ? "owner" : "member",
      setCount: classroom._count.flashcardSets,
      updatedAt: classroom.updatedAt.toISOString(),
    })),
    flashcardSets: flashcardSets.map((set) => ({
      createdAt: set.createdAt.toISOString(),
      description: set.description,
      flashcardCount: set._count.flashcards,
      id: set.id,
      title: set.title,
      updatedAt: set.updatedAt.toISOString(),
      visibility: set.visibility,
    })),
    folders: folders.map((folder) => ({
      createdAt: folder.createdAt.toISOString(),
      description: folder.description,
      id: folder.id,
      name: folder.name,
      setCount: folder._count.flashcardSets,
      updatedAt: folder.updatedAt.toISOString(),
    })),
  });
};
