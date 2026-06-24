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

export default async function FlashcardSetTestPage({
  params,
  searchParams,
}: FlashcardSetTestPageProps) {
  const [{ id }, options] = await Promise.all([params, searchParams]);

  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
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
              <TestEngine flashcardSetId={id} searchParams={options} />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
