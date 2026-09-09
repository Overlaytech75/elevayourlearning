import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Accent = "blue" | "violet" | "emerald" | "amber" | "rose";

const MODE_KEY = "atlas:theme-mode";
const ACCENT_KEY = "atlas:accent";

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "blue", label: "Alpine", swatch: "oklch(0.56 0.13 235)" },
  { id: "violet", label: "Dusk", swatch: "oklch(0.56 0.13 265)" },
  { id: "emerald", label: "Lagoon", swatch: "oklch(0.62 0.12 190)" },
  { id: "amber", label: "Sunrise", swatch: "oklch(0.72 0.13 78)" },
  { id: "rose", label: "Alpenglow", swatch: "oklch(0.62 0.16 20)" },
];

const ACCENT_VALUES: Record<Accent, string> = {
  blue: "oklch(0.56 0.13 235)",
  violet: "oklch(0.56 0.13 265)",
  emerald: "oklch(0.60 0.11 190)",
  amber: "oklch(0.70 0.13 78)",
  rose: "oklch(0.60 0.16 20)",
};


function applyMode(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("dark");
}

function applyAccent(accent: Accent) {
  if (typeof document === "undefined") return;
  const value = ACCENT_VALUES[accent];
  document.documentElement.style.setProperty("--primary", value);
  document.documentElement.style.setProperty("--ring", value);
  document.documentElement.style.setProperty("--sidebar-primary", value);
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [accent, setAccentState] = useState<Accent>("blue");

  useEffect(() => {
    const storedAccent = (localStorage.getItem(ACCENT_KEY) as Accent | null) ?? "blue";
    setAccentState(storedAccent);
    applyMode("light");
    applyAccent(storedAccent);

  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(MODE_KEY, next);
    applyMode(next);
  }, []);

  const setAccent = useCallback((next: Accent) => {
    setAccentState(next);
    localStorage.setItem(ACCENT_KEY, next);
    applyAccent(next);
  }, []);

  return { mode, accent, setMode, setAccent };
}
