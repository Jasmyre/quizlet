import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import { ProfileContent } from "@/components/pages/(app)/user/profile-content";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserProfile } from "@/lib/user-profile";
import { HydrateClient } from "@/trpc/server";

const UserPageContent = async ({
  params,
}: {
  params: Promise<{ usernameOrId: string }>;
}) => {
  const { usernameOrId } = await params;
  const session = await auth();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a delay for demonstration purposes

  // Normalize the input by decoding URI components
  const decodedUsernameOrId = decodeURIComponent(usernameOrId);

  const profile = await getUserProfile({
    usernameOrId: decodedUsernameOrId,
    viewerUserId: session?.user?.id,
  });

  if (!profile) {
    notFound();
  }

  return <ProfileContent profile={profile} />;
};

const UserPageContentSkeleton = () => (
  <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <div className="flex w-full min-w-0 flex-col justify-between gap-4 md:flex-row">
          <div className="flex min-w-0 flex-row items-start gap-5 max-md:flex-col md:items-center">
            <Skeleton className="size-32 rounded" />

            <div className="min-w-0">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <Skeleton className="h-10 w-48 rounded-md" />
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-3 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-24" />
                  </span>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </section>

    <Tabs className="gap-6" defaultValue="flashcard-sets">
      <div className="overflow-x-auto">
        <TabsList className="min-w-max">
          <TabsTrigger value="flashcard-sets">
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
          <TabsTrigger value="classes">
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
          <TabsTrigger value="folders">
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent className="flex flex-col gap-6" value="flashcard-sets">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Skeleton className="h-8 w-full rounded-md lg:max-w-lg" />

          <div className="flex flex-wrap gap-2 md:flex-nowrap lg:ml-auto">
            <Button type="button" variant="outline">
              <Skeleton className="h-4 w-20" />
            </Button>

            <Button type="button" variant="outline">
              <Skeleton className="h-4 w-20" />
            </Button>

            <Button type="button" variant="outline">
              <Skeleton className="h-4 w-20" />
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {new Array(3).fill(null).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static and do not change, so using the index as a key is acceptable here.
            <section className="flex min-w-0 flex-col gap-2" key={index}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="font-heading font-semibold text-muted-foreground text-xs uppercase tracking-normal">
                  <Skeleton className="h-4 w-20" />
                </span>
                <Separator className="flex-1" />
              </div>
              <div className="grid min-w-0 gap-x-4 gap-y-5 lg:grid-cols-1">
                {new Array(3).fill(null).map((_, setIndex) => (
                  <div
                    className={
                      "min-w-0 rounded-2xl border bg-transparent py-2 text-foreground shadow-none ring-0 transition-colors"
                    }
                    // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static and do not change, so using the index as a key is acceptable here.
                    key={setIndex}
                  >
                    <CardContent className="group flex min-w-0 items-center gap-4 px-2">
                      <div className="min-w-0 flex-1">
                        <span className="line-clamp-1 font-semibold text-sm leading-5">
                          <Skeleton className="h-9 w-full" />
                        </span>
                      </div>
                    </CardContent>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  </div>
);

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
                <h1 className="font-semibold text-lg tracking-tight">
                  Profile
                </h1>
              </div>
              <MagicBackButton backLink={"/"} className="md:hidden" />
            </div>
          </header>
          <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center py-4">
            <Suspense fallback={<UserPageContentSkeleton />}>
              <UserPageContent params={params} />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
