import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Accent = "blue" | "violet" | "emerald" | "amber" | "rose";

const MODE_KEY = "atlas:theme-mode";
const ACCENT_KEY = "atlas:accent";

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: "blue", label: "Electric", swatch: "oklch(0.60 0.19 258)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.60 0.20 300)" },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.65 0.15 160)" },
  { id: "amber", label: "Amber", swatch: "oklch(0.75 0.15 70)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.64 0.20 15)" },
];

const ACCENT_VALUES: Record<Accent, string> = {
  blue: "oklch(0.60 0.19 258)",
  violet: "oklch(0.60 0.20 300)",
  emerald: "oklch(0.62 0.14 160)",
  amber: "oklch(0.72 0.15 70)",
  rose: "oklch(0.62 0.20 15)",
};

function applyMode(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = mode === "dark" || (mode === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

function applyAccent(accent: Accent) {
  if (typeof document === "undefined") return;
  const value = ACCENT_VALUES[accent];
  document.documentElement.style.setProperty("--primary", value);
  document.documentElement.style.setProperty("--ring", value);
  document.documentElement.style.setProperty("--sidebar-primary", value);
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [accent, setAccentState] = useState<Accent>("blue");

  useEffect(() => {
    const storedMode = (localStorage.getItem(MODE_KEY) as ThemeMode | null) ?? "system";
    const storedAccent = (localStorage.getItem(ACCENT_KEY) as Accent | null) ?? "blue";
    setModeState(storedMode);
    setAccentState(storedAccent);
    applyMode(storedMode);
    applyAccent(storedAccent);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(MODE_KEY) as ThemeMode | null) === "system") applyMode("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
