"use client";

import { HeroUIProvider as HeroUI } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function HeroUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="dashboard-theme"
    >
      <HeroUI>{children}</HeroUI>
    </NextThemesProvider>
  );
}
