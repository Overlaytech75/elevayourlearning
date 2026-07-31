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
  Timer,
  FileText,
  Wand2,
  Moon,
  Sun,
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
import { useTheme } from "@/lib/theme";
import { useAuth, displayNameOf } from "@/lib/auth";

const primary = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Academics", url: "/academics", icon: GraduationCap },
  { title: "Timeline", url: "/timeline", icon: CalendarClock },
  { title: "Productivity", url: "/productivity", icon: CheckSquare },
  { title: "Finance", url: "/finance", icon: Wallet },
];

const learn = [
  { title: "Study tools", url: "/study", icon: Timer },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "AI tools", url: "/ai-tools", icon: Wand2 },
];

const secondary = [
  { title: "Goals", url: "/goals", icon: Target },
  { title: "International", url: "/international", icon: Globe2 },
  { title: "Career", url: "/career", icon: Briefcase },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Mentor", url: "/mentor", icon: Bot },
];


export function AppSidebar() {
  const { mode, setMode } = useTheme();
  const { user } = useAuth();
  const name = displayNameOf(user, "Sakif");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const handleNav = () => {
    if (isMobile) setOpenMobile(false);
  };

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
                    <Link to={item.url} onClick={handleNav}>
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
          <SidebarGroupLabel>Learn</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learn.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} onClick={handleNav}>
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
                    <Link to={item.url} onClick={handleNav}>
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
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="grid min-w-0 flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
            <Link to="/auth" onClick={handleNav} className="truncate font-medium hover:underline">
              {name}
            </Link>
            <span className="truncate text-muted-foreground">
              {user ? "Signed in" : "Not signed in"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground group-data-[collapsible=icon]:hidden"
          >
            {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
