"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 sm:w-20 sm:h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-8 w-16 sm:h-10 sm:w-20 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-500 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isDark ? "bg-slate-700 hover:bg-slate-600 shadow-inner" : "bg-slate-200 hover:bg-slate-300 shadow-inner"
      )}
      title="Alternar tema"
      aria-label="Alternar tema"
    >
      <span className="sr-only">Alternar tema</span>
      {/* Sun icon (behind the switch) */}
      <span className={cn(
        "absolute left-2 sm:left-2.5 transition-all duration-500",
        isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
      )}>
        <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
      </span>
      
      {/* Moon icon (behind the switch) */}
      <span className={cn(
        "absolute right-2 sm:right-2.5 transition-all duration-500",
        isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
      )}>
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-300" />
      </span>

      {/* The sliding toggle thumb */}
      <span
        className={cn(
          "pointer-events-none inline-block h-6 w-6 sm:h-8 sm:w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-500 ease-in-out",
          isDark ? "translate-x-9 sm:translate-x-11" : "translate-x-1"
        )}
      >
        <span className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-500",
          isDark ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
        )}>
          <Moon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-700" />
        </span>
        <span className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-500",
          isDark ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
        )}>
          <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
        </span>
      </span>
    </button>
  );
}
