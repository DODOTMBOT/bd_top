"use client";
import { Spinner as HSpinner } from "@heroui/react";
import { cn } from "@/lib/cn";

export type SpinnerProps = React.ComponentProps<typeof HSpinner>;

export function Spinner({ className, ...props }: SpinnerProps) {
  return <HSpinner {...props} className={cn(className)} />;
}

export default Spinner;
