"use client";
import { Badge as HBadge } from "@heroui/react";
import { cn } from "@/lib/cn";

export type BadgeProps = React.ComponentProps<typeof HBadge>;

export function Badge({ className, ...props }: BadgeProps) {
  return <HBadge {...props} className={cn(className)} />;
}

export default Badge;
