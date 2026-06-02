import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { LibraryContent } from "@/components/pages/(app)/library/library-content";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getUserLibrary } from "@/lib/user-library";
import { HydrateClient } from "@/trpc/server";

const LibraryPageContent = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/auth");
  }

  const library = await getUserLibrary(userId);

  return <LibraryContent library={library} />;
};

export default function LibraryPage() {
  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                orientation="vertical"
              />
            </div>
          </header>
          <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center">
            <Suspense fallback={<div>Loading...</div>}>
              <LibraryPageContent />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
