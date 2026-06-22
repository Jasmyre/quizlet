import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import { ProfileContent } from "@/components/pages/(app)/user/profile-content";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getUserProfile } from "@/lib/user-profile";
import { HydrateClient } from "@/trpc/server";

const UserPageContent = async ({
  params,
}: {
  params: Promise<{ usernameOrId: string }>;
}) => {
  const { usernameOrId } = await params;
  const session = await auth();
  const profile = await getUserProfile({
    usernameOrId,
    viewerUserId: session?.user?.id,
  });

  if (!profile) {
    notFound();
  }

  return <ProfileContent profile={profile} />;
};

export default function UserPage({
  params,
}: {
  params: Promise<{ usernameOrId: string }>;
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
                <h1 className="font-semibold text-lg tracking-tight">Profile</h1>
              </div>
              <MagicBackButton backLink={"/"} className="md:hidden" />
            </div>
          </header>
          <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center py-4">
            <Suspense fallback={<div>Loading...</div>}>
              <UserPageContent params={params} />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
