-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderFlashcardSet" (
    "folderId" TEXT NOT NULL,
    "flashcardSetId" TEXT NOT NULL,

    CONSTRAINT "FolderFlashcardSet_pkey" PRIMARY KEY ("folderId","flashcardSetId")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMember" (
    "classroomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassMember_pkey" PRIMARY KEY ("classroomId","userId")
);

-- CreateTable
CREATE TABLE "ClassFlashcardSet" (
    "classroomId" TEXT NOT NULL,
    "flashcardSetId" TEXT NOT NULL,

    CONSTRAINT "ClassFlashcardSet_pkey" PRIMARY KEY ("classroomId","flashcardSetId")
);

-- CreateIndex
CREATE INDEX "Folder_ownerId_idx" ON "Folder"("ownerId");

-- CreateIndex
CREATE INDEX "FolderFlashcardSet_flashcardSetId_idx" ON "FolderFlashcardSet"("flashcardSetId");

-- CreateIndex
CREATE INDEX "Classroom_ownerId_idx" ON "Classroom"("ownerId");

-- CreateIndex
CREATE INDEX "ClassMember_userId_idx" ON "ClassMember"("userId");

-- CreateIndex
CREATE INDEX "ClassFlashcardSet_flashcardSetId_idx" ON "ClassFlashcardSet"("flashcardSetId");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderFlashcardSet" ADD CONSTRAINT "FolderFlashcardSet_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderFlashcardSet" ADD CONSTRAINT "FolderFlashcardSet_flashcardSetId_fkey" FOREIGN KEY ("flashcardSetId") REFERENCES "FlashcardSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMember" ADD CONSTRAINT "ClassMember_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMember" ADD CONSTRAINT "ClassMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassFlashcardSet" ADD CONSTRAINT "ClassFlashcardSet_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassFlashcardSet" ADD CONSTRAINT "ClassFlashcardSet_flashcardSetId_fkey" FOREIGN KEY ("flashcardSetId") REFERENCES "FlashcardSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
