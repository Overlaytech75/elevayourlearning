/**
 * Single source of truth for Eleva's social profiles.
 * Swap the URLs below for the real profiles — everything else updates.
 */
export interface SocialLink {
  id: "facebook" | "instagram" | "x" | "telegram";
  label: string;
  url: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { id: "facebook", label: "Facebook", url: "https://facebook.com/elevalearning" },
  { id: "instagram", label: "Instagram", url: "https://instagram.com/elevalearning" },
  { id: "x", label: "X", url: "https://x.com/elevalearning" },
  { id: "telegram", label: "Telegram", url: "https://t.me/elevalearning" },
];

export const SUPPORT_EMAIL = "support@eleva.app";
