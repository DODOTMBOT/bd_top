"use client";
import { Input as HInput } from "@heroui/react";
import { cn } from "@/lib/cn";

export type InputProps = React.ComponentProps<typeof HInput>;

export function Input({ className, ...props }: InputProps) { 
  return <HInput {...props} className={cn(className)} />; 
}

export default Input;
