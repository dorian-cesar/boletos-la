"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  const isParaguay = pathname?.startsWith("/paraguay");
  const forcedTheme = isParaguay ? undefined : "dark";

  return (
    <NextThemesProvider {...props} forcedTheme={forcedTheme}>
      {children}
    </NextThemesProvider>
  );
}
