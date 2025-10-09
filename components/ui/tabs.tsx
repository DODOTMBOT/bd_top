"use client";
import { Tabs as HTabs, Tab as HTab } from "@heroui/react";
import { cn } from "@/lib/cn";

export type TabsProps = React.ComponentProps<typeof HTabs>;
export type TabProps = React.ComponentProps<typeof HTab>;

export function Tabs({ className, ...props }: TabsProps) {
  return <HTabs {...props} className={cn(className)} />;
}

export function Tab({ className, ...props }: TabProps) {
  return <HTab {...props} className={cn(className)} />;
}
