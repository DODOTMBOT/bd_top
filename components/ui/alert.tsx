"use client";
import { Alert as HAlert } from "@heroui/react";
import { cn } from "@/lib/cn";

export type AlertProps = React.ComponentProps<typeof HAlert>;

export function Alert({ className, ...props }: AlertProps) {
  return <HAlert {...props} className={cn(className)} />;
}

export default Alert;
