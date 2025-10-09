"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("h-full");
    document.body.classList.add("min-h-screen");
  }, []);

  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
}
