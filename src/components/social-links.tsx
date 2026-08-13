import { Facebook, Instagram, Send, Twitter } from "lucide-react";

import { SOCIAL_LINKS, type SocialLink } from "@/lib/social";
import { cn } from "@/lib/utils";

const ICONS: Record<SocialLink["id"], typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  x: Twitter,
  telegram: Send,
};

export function SocialLinks({
  className,
  size = "default",
}: {
  className?: string;
  size?: "sm" | "default";
}) {
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {SOCIAL_LINKS.map((s) => {
        const Icon = ICONS[s.id];
        return (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={s.label}
            title={s.label}
            className={cn(
              box,
              "flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary",
            )}
          >
            <Icon className={icon} />
          </a>
        );
      })}
    </div>
  );
}
