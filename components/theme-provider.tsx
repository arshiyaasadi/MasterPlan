"use client";

import { useEffect } from "react";
import { useThemeStore, applyThemeToDocument } from "@/store/use-theme-store";

/**
 * Applies theme from store to document and keeps in sync (dark class on html).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  return <>{children}</>;
}
