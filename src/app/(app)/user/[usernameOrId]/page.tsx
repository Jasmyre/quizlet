import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ProfileContent } from "@/components/pages/(app)/user/profile-content";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  type UserProfile,
  userProfileSchema,
} from "@/schemas/user-profile-schema";
import { HydrateClient } from "@/trpc/server";

const mockUserProfile = userProfileSchema.parse({
  avatarUrl: "https://github.com/shadcn.png",
  bio: "Always learning.",
  classes: [
    {
      id: "class-social-science",
      memberCount: 28,
      name: "Social Sciences Circle",
      setCount: 7,
    },
    {
      id: "class-outdoor-skills",
      memberCount: 16,
      name: "Outdoor Skills Review",
      setCount: 4,
    },
  ],
  folders: [
    {
      id: "folder-board-review",
      name: "Board review",
      setCount: 8,
    },
    {
      id: "folder-outdoor-skills",
      name: "Outdoor skills",
      setCount: 5,
    },
  ],
  id: "user-01",
  joinedAt: "Joined Jan 2024",
  name: "Jazmyre Andrei",
  stats: {
    cards: 186,
    classes: 2,
    folders: 2,
    friends: 37,
    sets: 4,
  },
  flashcardSets: [
    {
      avgScore: 82,
      createdAt: "2026-05-08T08:00:00.000Z",
      description: "Outdoor Skills",
      flashcardCount: 20,
      id: "set-essential-rope-knots",
      practiceCount: 12,
      sectionLabel: "This month",
      studiedAtOrder: 40,
      title:
        "Essential Rope Knots for Camping and Climbing: Definitions and Uses",
      updatedAt: "2026-05-23T08:00:00.000Z",
      userId: "user-01",
      visibility: "PUBLIC",
    },
    {
      avgScore: 76,
      createdAt: "2026-05-04T08:00:00.000Z",
      description: "Social Sciences",
      flashcardCount: 22,
      id: "set-globalization-ethics",
      practiceCount: 9,
      sectionLabel: "This month",
      studiedAtOrder: 35,
      title:
        "Globalization, Ethics, and Generational Perspectives in Social Sciences",
      updatedAt: "2026-05-21T08:00:00.000Z",
      userId: "user-01",
      visibility: "PUBLIC",
    },
    {
      avgScore: 71,
      createdAt: "2026-05-01T08:00:00.000Z",
      description: "Social Sciences",
      flashcardCount: 27,
      id: "set-generational-perspectives",
      practiceCount: 14,
      sectionLabel: "This month",
      studiedAtOrder: 28,
      title:
        "Globalization, Ethics, and Generational Perspectives in Social Sciences",
      updatedAt: "2026-05-18T08:00:00.000Z",
      userId: "user-01",
      visibility: "PUBLIC",
    },
    {
      avgScore: 68,
      createdAt: "2026-04-08T08:00:00.000Z",
      description: "ROTC",
      flashcardCount: 53,
      id: "set-rotc-prefinal",
      practiceCount: 6,
      sectionLabel: "In April 2026",
      studiedAtOrder: 8,
      title: "rotc prefinal",
      updatedAt: "2026-04-08T08:00:00.000Z",
      userId: "user-01",
      visibility: "PUBLIC",
    },
  ],
  username: "lanuzajazmyreandrei",
} satisfies UserProfile);

const UserPageContent = async ({
  params,
}: {
  params: Promise<{ usernameOrId: string }>;
}) => {
  const { usernameOrId } = await params;
  const profile = {
    ...mockUserProfile,
    username: usernameOrId,
  };

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
              <UserPageContent params={params} />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}
