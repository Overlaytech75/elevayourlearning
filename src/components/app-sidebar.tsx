import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarClock,
  Wallet,
  Target,
  Sparkles,
  CheckSquare,
  BarChart3,
  Bot,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const primary = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Academics", url: "/academics", icon: GraduationCap },
  { title: "Timeline", url: "/timeline", icon: CalendarClock },
  { title: "Productivity", url: "/productivity", icon: CheckSquare },
  { title: "Finance", url: "/finance", icon: Wallet },
];

const secondary = [
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Mentor", url: "/mentor", icon: Bot },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="grid text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-semibold tracking-tight">Atlas</span>
            <span className="text-[11px] text-muted-foreground">Personal OS</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Life</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-xs font-semibold text-primary-foreground">
            SK
          </div>
          <div className="grid text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-medium">Sakif</span>
            <span className="text-muted-foreground">Local prototype</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
