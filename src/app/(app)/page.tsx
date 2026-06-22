import { AppSidebar } from "@/components/app-sidebar";
import { RecentTestSlider } from "@/components/pages/(app)/home/recent-test";
import { Recents } from "@/components/pages/(app)/home/recents";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-start px-4 md:gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                orientation="vertical"
              />
              <h1 className="font-semibold text-lg tracking-tight">Home</h1>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-5xl justify-center py-4">
            <div className="flex w-full flex-col gap-8">
              <RecentTestSlider />
              <Recents />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
