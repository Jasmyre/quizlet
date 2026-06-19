import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import { CreateFlashcardSetForm } from "@/components/pages/(app)/flashcards/create-flashcard-set-form";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HydrateClient } from "@/trpc/server";

export default async function Page() {
  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between px-4 md:justify-start">
              <div className="gap2 flex items-center">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                  orientation="vertical"
                />
              </div>
              <MagicBackButton backLink={"/"} />
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-5xl justify-center py-4">
            <div className="flex w-full flex-col gap-8">
              <Suspense fallback={null}>
                <CreateFlashcardSetForm />
              </Suspense>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
