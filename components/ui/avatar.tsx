"use client";
import { Avatar as HAvatar } from "@heroui/react";
import { cn } from "@/lib/cn";

export type AvatarProps = React.ComponentProps<typeof HAvatar>;

export function Avatar({ className, ...props }: AvatarProps) {
  return <HAvatar {...props} className={cn(className)} />;
}

export default Avatar;
