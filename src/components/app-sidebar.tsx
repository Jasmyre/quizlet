import {
  ChartArea,
  CirclePlus,
  Folders,
  HomeIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { NavLogoHeader } from "@/components/nav-logo-header";
import type { NavMainItem } from "@/components/nav-main";
import { NavMain } from "@/components/nav-main";
import { SidebarFooterContent } from "@/components/nav-user";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
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
  navMain: NavMainItem[];
};

const items: NavMainItem[] = [
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
];

const sidebarContentContent = async () => <NavMain items={data.navMain} />;

const SidebarContentSkeleton = () => (
  <>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="relative">
        <SidebarInput
          aria-describedby="command-search-shortcut"
          aria-label="Open command search"
          className="pr-18"
          disabled
          placeholder="Search commands..."
          readOnly
          value=""
        />
        <div
          className="pointer-events-none absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1"
          id="command-search-shortcut"
        >
          <span className="sr-only">Shortcut: Control or Command plus K</span>
          <Kbd aria-hidden="true">Ctrl</Kbd>
          <Kbd aria-hidden="true">K</Kbd>
        </div>
      </div>
    </SidebarGroup>

    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground">
        Navigation
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={"hover:bg-muted data-[active=true]:bg-accent"}
              disabled
              tooltip={item.title}
            >
              <Link aria-disabled href={item.url}>
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>

    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground">
        Start here
      </SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="bg-accent hover:bg-accent/70"
            disabled
            tooltip="Create flashcards"
          >
            <Link aria-disabled href={"/flashcards/create"}>
              <CirclePlus />
              <span>Create Flashcards</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>

    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground">
        Quick Actions
      </SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="hover:bg-muted"
            disabled
            tooltip="Toggle theme"
          >
            <SunIcon />
            <span>Toggle Theme</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="hover:bg-muted"
            disabled
            tooltip="Settings"
          >
            <SettingsIcon />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  </>
);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-background">
        <NavLogoHeader />
      </SidebarHeader>
      <Separator />
      <SidebarContent className="bg-background">
        <Suspense fallback={<SidebarContentSkeleton />}>
          {sidebarContentContent()}
        </Suspense>
      </SidebarContent>
      <SidebarFooter className="bg-background">
        <SidebarFooterContent />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
