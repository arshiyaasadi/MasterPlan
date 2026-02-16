"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/use-theme-store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-foreground"
      aria-label={theme === "light" ? "فعال‌سازی حالت تاریک" : "فعال‌سازی حالت روشن"}
    >
      {theme === "light" ? (
        <Moon className="size-5" aria-hidden />
      ) : (
        <Sun className="size-5" aria-hidden />
      )}
    </Button>
  );
}
