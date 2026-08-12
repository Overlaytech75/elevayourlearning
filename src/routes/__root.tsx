import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,

  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { PreviewGate } from "@/components/preview-gate";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Today · Eleva" },
      {
        name: "description",
        content:
          "Your calm command center: today's classes, deadlines, and what to focus on next.",
      },
      { name: "author", content: "Eleva" },
      { property: "og:title", content: "Today · Eleva" },
      {
        property: "og:description",
        content:
          "Your calm command center: today's classes, deadlines, and what to focus on next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Today · Eleva" },
      { name: "twitter:description", content: "Your calm command center: today's classes, deadlines, and what to focus on next." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6edcf84d-81bf-4fdb-8dc7-e143a8f04385/id-preview-d820b9a0--2b68c050-4e7c-4129-9987-755dbcaa9a22.lovable.app-1784732754732.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6edcf84d-81bf-4fdb-8dc7-e143a8f04385/id-preview-d820b9a0--2b68c050-4e7c-4129-9987-755dbcaa9a22.lovable.app-1784732754732.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const SECTION_LABELS: { prefix: string; label: string }[] = [
  { prefix: "/academics", label: "Academics" },
  { prefix: "/timeline", label: "Timeline" },
  { prefix: "/study", label: "Study" },
  { prefix: "/notes", label: "Notes" },
  { prefix: "/ai-tools", label: "AI Tools" },
  { prefix: "/mentor", label: "AI Mentor" },
  { prefix: "/productivity", label: "Productivity" },
  { prefix: "/finance", label: "Finance" },
  { prefix: "/goals", label: "Goals" },
  { prefix: "/analytics", label: "Analytics" },
  { prefix: "/international", label: "International" },
  { prefix: "/career", label: "Career" },
];

function sectionLabel(pathname: string) {
  return SECTION_LABELS.find((s) => pathname.startsWith(s.prefix))?.label ?? "Today";
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname.startsWith("/auth");

  if (bare) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-transparent">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/60 bg-card/40 px-3 backdrop-blur-xl">
              <SidebarTrigger className="text-muted-foreground transition-colors duration-200 hover:text-foreground" />

              <div className="ml-1 min-w-0 truncate text-sm text-muted-foreground">
              <div className="ml-1 flex min-w-0 items-center gap-2 truncate text-sm text-muted-foreground">
                <img src={elevaMark.url} alt="Eleva logo" className="h-6 w-6 shrink-0 object-contain" />
                <span className="font-display font-medium text-foreground">Eleva</span>
                <span className="text-muted-foreground/60">/</span>
                <span className="truncate">{sectionLabel(pathname)}</span>
              </div>
            </header>

            <main className="flex-1">
              <PreviewGate>
                <Outlet />
              </PreviewGate>
            </main>

          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

