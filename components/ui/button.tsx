"use client";
import { Button as HButton, type ButtonProps as HProps } from "@heroui/react";
import { cn } from "@/lib/cn";

export type ButtonProps = Omit<HProps, "color"> & { 
  variant?: HProps["variant"]; 
  color?: HProps["color"]; 
};

export function Button({ className, ...props }: ButtonProps) {
  return <HButton {...props} className={cn(className)} />;
}

export default Button;
