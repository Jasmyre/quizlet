// Depends on the sidebar shell and the client-side test engine rendered inside the route content area.
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
          <Suspense
            fallback={
              <div className="flex h-16 items-center px-4">Loading...</div>
            }
          >
            <TestPageContent params={params} searchParams={searchParams} />
          </Suspense>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}

// 2. We move the runtime data access into this deeper child component.
async function TestPageContent({
  params,
  searchParams,
}: FlashcardSetTestPageProps) {
  // Await the promises here, inside the Suspense boundary.
  const [{ id }, options] = await Promise.all([params, searchParams]);

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
          <TestEngine searchParams={options} />
        </div>
      </main>
    </>
  );
}
