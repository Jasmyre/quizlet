"use client";

import { ChartArea, Folders, HomeIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { NavLogoHeader } from "@/components/nav-logo-header";
import type { NavMainItem } from "@/components/nav-main";
import { NavMain } from "@/components/nav-main";
import type { NavUserData } from "@/components/nav-user";
import { NavUser } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: <HomeIcon />,
    },
    {
      title: "Your library",
      url: "/library",
      icon: <Folders />,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <ChartArea />,
    },
  ],
} satisfies {
  user: NavUserData;
  navMain: NavMainItem[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const sidebarUser: NavUserData = {
    name: session?.user?.name ?? data.user.name,
    email: session?.user?.email ?? data.user.email,
    avatar: session?.user?.image ?? data.user.avatar,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-background">
        <NavLogoHeader />
      </SidebarHeader>
      <Separator />
      <SidebarContent className="bg-background">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="bg-background">
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
