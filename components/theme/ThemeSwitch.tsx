"use client";

import { useEffect, useState } from "react";
import { Switch } from "@nextui-org/react";
import { useTheme } from "next-themes";

const Sun = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
    <path d="M12 4V2m0 20v-2M4 12H2m20 0h-2M5.64 5.64 4.22 4.22m15.56 15.56-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
  </svg>
);
const Moon = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" fill="currentColor"/>
  </svg>
);

export default function ThemeSwitch({ label = "Dark mode" }: { label?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = (theme ?? resolvedTheme) === "dark";

  return (
    <Switch
      isSelected={isDark}
      onValueChange={(v) => setTheme(v ? "dark" : "light")}
      size="lg"
      color="secondary"
      thumbIcon={({ isSelected, className }) => (
        <span className={className}>{isSelected ? <Moon/> : <Sun/>}</span>
      )}
    >
      {label}
    </Switch>
  );
}


