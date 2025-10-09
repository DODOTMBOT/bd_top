"use client";
import { Textarea as HTextarea } from "@heroui/react";
import { cn } from "@/lib/cn";

export type TextareaProps = React.ComponentProps<typeof HTextarea>;

export function Textarea({ className, ...props }: TextareaProps) {
  return <HTextarea {...props} className={cn(className)} />;
}

export default Textarea;
