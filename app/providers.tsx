"use client";
import { HeroUIProvider } from "@heroui/react";
import { DialogCenterProvider } from "@/components/ui/DialogCenter";
import ProvidersInner from "@/app/providers-inner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <DialogCenterProvider>
        <ProvidersInner>{children}</ProvidersInner>
      </DialogCenterProvider>
    </HeroUIProvider>
  );
}