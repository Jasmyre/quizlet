import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import { LibraryPageContent } from "@/components/pages/(app)/library/library-page-content";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HydrateClient } from "@/trpc/server";

export default function LibraryPage() {
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
                  Library
                </h1>
              </div>
              <MagicBackButton backLink={"/"} className="md:hidden" />
            </div>
          </header>
          <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center py-4">
            <LibraryPageContent />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
