"use client";

import { HomeIcon, UsersIcon } from "lucide-react";
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
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: <HomeIcon />,
    },
    {
      title: "Social",
      url: "/social",
      icon: <UsersIcon />,
    },
  ],
} satisfies {
  user: NavUserData;
  navMain: NavMainItem[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
