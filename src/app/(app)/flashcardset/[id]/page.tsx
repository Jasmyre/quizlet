import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import { FlashcardSetContent } from "@/components/pages/(app)/flashcardset/flashcard-set-content";
import { FlashcardsColumn } from "@/components/pages/(app)/flashcardset/flashcards-column";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getFlashcardSet } from "@/lib/flashcard-set";
import { HydrateClient } from "@/trpc/server";

const FlashcardSetPageContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const session = await auth();
  const flashcardSet = await getFlashcardSet({
    id,
    viewerUserId: session?.user?.id,
  });

  if (!flashcardSet) {
    notFound();
  }

  return (
    <div className="w-full">
      <FlashcardSetContent flashcardSet={flashcardSet} />
      <FlashcardsColumn flashcards={flashcardSet.flashcards} />
    </div>
  );
};

export default function FlashcardSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between px-4 md:justify-start">
              <div className="gap2 flex items-center">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                  orientation="vertical"
                />
              </div>
              <MagicBackButton />
            </div>
          </header>
          <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center">
            <Suspense fallback={<div>Loading...</div>}>
              <FlashcardSetPageContent params={params} />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
