import { ChevronRightIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { TestEngine } from "./_components/test-engine";

interface FlashcardSetTestPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function FlashcardSetTestPage({
  params,
  searchParams,
}: FlashcardSetTestPageProps) {
  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <Suspense fallback={<TestPageContentSkeleton />}>
            <TestPageContent params={params} searchParams={searchParams} />
          </Suspense>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}

const TestPageContentSkeleton = () => (
  <>
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center justify-between px-4 md:justify-start md:gap-4">
        <SidebarTrigger className="-ml-1 max-md:hidden" />
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <MagicBackButton className="max-md:hidden" disabled />
          <Separator
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            orientation="vertical"
          />
          <h1 className="font-semibold text-lg tracking-tight">
            Flashcard Test
          </h1>
        </div>
        <MagicBackButton className="md:hidden" disabled />
      </div>
    </header>

    <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center py-4">
      <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-6 w-30" />
              </div>
              <div className="text-right">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>
            <Progress aria-label="Test progress" value={0} />
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-2xl leading-tight">
                <Skeleton className="h-6 w-48" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-3">
                <Card
                  className={cn(
                    "cursor-pointer border transition-colors",
                    "hover:border-primary/40 hover:bg-muted/40"
                  )}
                  role="button"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Skeleton className="h-3.5 w-16" />
              <Separator className="h-4" orientation="vertical" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="flex gap-2">
              <Button disabled type="button">
                Continue
                <ChevronRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </>
);

async function TestPageContent({
  params,
  searchParams,
}: FlashcardSetTestPageProps) {
  const [{ id }, options, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);
  const flashcardSet = await getFlashcardSet({
    id,
    viewerUserId: session?.user?.id,
  });

  if (!flashcardSet) {
    notFound();
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex w-full items-center justify-between px-4 md:justify-start md:gap-4">
          <SidebarTrigger className="-ml-1 max-md:hidden" />
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <MagicBackButton
              backLink={`/flashcardset/${encodeURIComponent(id)}`}
              className="max-md:hidden"
            />
            <Separator
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              orientation="vertical"
            />
            <h1 className="font-semibold text-lg tracking-tight">
              Flashcard Test
            </h1>
          </div>
          <MagicBackButton
            backLink={`/flashcardset/${encodeURIComponent(id)}`}
            className="md:hidden"
          />
        </div>
      </header>

      <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center py-4">
        <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
          <TestEngine
            flashcards={flashcardSet.flashcards}
            searchParams={options}
          />
        </div>
      </main>
    </>
  );
}
