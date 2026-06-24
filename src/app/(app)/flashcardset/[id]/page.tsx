import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import { FlashcardSetActions } from "@/components/pages/(app)/flashcardset/flashcard-set-actions";
import { FlashcardSetContent } from "@/components/pages/(app)/flashcardset/flashcard-set-content";
import { FlashcardsColumn } from "@/components/pages/(app)/flashcardset/flashcards-column";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getFlashcardSet } from "@/lib/flashcard-set";
import { cn } from "@/lib/utils";
import { HydrateClient } from "@/trpc/server";

const FlashcardSetPageContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const [{ id }, session] = await Promise.all([params, auth()]);
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
      <FlashcardSetActions flashcardSet={flashcardSet} />
      <FlashcardsColumn flashcards={flashcardSet.flashcards} />
    </div>
  );
};

const FlashcardSetPageContentSkeleton = () => (
  <div className="min-h-screen w-full">
    <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7.5 w-30" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        <Separator />
      </section>

      <section className="flex min-w-0 flex-col gap-4 overflow-x-clip px-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Skeleton className="h-3.5 w-20" />
          </div>
          <Skeleton className="h-3.5 w-20" />
        </div>

        <div className="flex min-w-0 items-center gap-3 overflow-x-clip py-2">
          <div
            className="relative h-80 min-w-0 flex-1 overflow-visible sm:h-112"
            style={{ perspective: "1000px" }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-[opacity,transform] ease-out"
            >
              <div
                className="relative size-full rounded-xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 flex overflow-hidden rounded-xl bg-card p-6 text-card-foreground sm:p-8">
                  <div className="flex size-full flex-col justify-between gap-6">
                    <CardHeader className="px-0">
                      <CardDescription>
                        <Skeleton className="h-3.5 w-20" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid min-h-0 flex-1 place-items-center overflow-y-auto px-0 text-center">
                      <CardTitle className="max-w-3xl text-balance text-2xl leading-tight sm:text-4xl">
                        <Skeleton className="h-6 w-20 sm:h-9" />
                      </CardTitle>
                    </CardContent>
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </div>
              </div>
            </div>

            <button
              className={cn(
                "group absolute inset-0 grid touch-pan-y select-none place-items-center rounded-xl border bg-card p-0 text-left shadow-sm outline-none transition-[box-shadow,transform] ease-out focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "cursor-pointer",
                "hover:shadow-md"
              )}
              type="button"
            >
              <div
                className="relative size-full rounded-xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 flex overflow-hidden rounded-xl bg-card p-6 text-card-foreground sm:p-8">
                  <div className="flex size-full flex-col justify-between gap-6">
                    <CardHeader className="px-0">
                      <CardDescription>
                        <Skeleton className="h-3.5 w-20" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid min-h-0 flex-1 place-items-center overflow-y-auto px-0 text-center">
                      <CardTitle className="max-w-3xl text-balance text-2xl leading-tight sm:text-4xl">
                        <Skeleton className="h-6 sm:h-9" />
                      </CardTitle>
                    </CardContent>
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button disabled type="button" variant="outline">
            <ChevronLeftIcon data-icon="inline-start" />
            Previous
          </Button>
          <Button disabled type="button" variant="outline">
            Next
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </section>
    </div>
  </div>
);

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
            <div className="flex w-full items-center justify-between px-4 md:justify-start md:gap-4">
              <SidebarTrigger className="-ml-1 max-md:hidden" />
              <div className="gap2 flex items-center">
                <SidebarTrigger className="-ml-1 md:hidden" />
                <MagicBackButton backLink={"/"} className="max-md:hidden" />
                <Separator
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                  orientation="vertical"
                />
                <h1 className="font-semibold text-lg tracking-tight">
                  Flashcard Set
                </h1>
              </div>
              <MagicBackButton backLink={"/"} className="md:hidden" />
            </div>
          </header>
          <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center py-4">
            <Suspense fallback={<FlashcardSetPageContentSkeleton />}>
              <FlashcardSetPageContent params={params} />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
