"use client";
import { Switch as HSwitch } from "@heroui/react";
import { cn } from "@/lib/cn";

export type SwitchProps = React.ComponentProps<typeof HSwitch>;

export function Switch({ className, ...props }: SwitchProps) {
  return <HSwitch {...props} className={cn(className)} />;
}

export default Switch;
