"use client";
import { Tooltip as HTooltip } from "@heroui/react";
import { cn } from "@/lib/cn";

export type TooltipProps = React.ComponentProps<typeof HTooltip>;

export function Tooltip({ className, ...props }: TooltipProps) {
  return <HTooltip {...props} className={cn(className)} />;
}

export default Tooltip;
