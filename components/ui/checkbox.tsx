"use client";
import { Checkbox as HCheckbox } from "@heroui/react";
import { cn } from "@/lib/cn";

export type CheckboxProps = React.ComponentProps<typeof HCheckbox>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return <HCheckbox {...props} className={cn(className)} />;
}

export default Checkbox;
