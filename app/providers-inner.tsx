"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { MenuProvider } from "@/src/contexts/MenuContext";

export default function ProvidersInner({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MenuProvider>{children}</MenuProvider>
    </SessionProvider>
  );
}

