"use client";
import { Select as HSelect, SelectItem as HSelectItem } from "@heroui/react";
import { cn } from "@/lib/cn";

export type SelectProps = React.ComponentProps<typeof HSelect>;
export type SelectItemProps = Omit<React.ComponentProps<typeof HSelectItem>, "value"> & {
  value?: string;
};

export function Select({ className, ...props }: SelectProps) {
  return <HSelect {...props} className={cn(className)} />;
}

export function SelectItem({ className, value, ...props }: SelectItemProps) {
  return <HSelectItem {...props} className={cn(className)} key={value} />;
}
