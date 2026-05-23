-- CreateEnum
CREATE TYPE "FlashcardSetVisibility" AS ENUM ('PUBLIC');

-- AlterTable
ALTER TABLE "FlashcardSet" ADD COLUMN "visibility" "FlashcardSetVisibility" NOT NULL DEFAULT 'PUBLIC';
