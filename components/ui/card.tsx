"use client";
import { Card as HCard, CardBody as HCardBody, CardHeader as HCardHeader, CardFooter as HCardFooter } from "@heroui/react";
import { cn } from "@/lib/cn";

export type CardProps = React.ComponentProps<typeof HCard>;
export type CardBodyProps = React.ComponentProps<typeof HCardBody>;
export type CardHeaderProps = React.ComponentProps<typeof HCardHeader>;
export type CardFooterProps = React.ComponentProps<typeof HCardFooter>;

export function Card({ className, ...props }: CardProps) {
  return <HCard {...props} className={cn(className)} />;
}

export function CardBody({ className, ...props }: CardBodyProps) {
  return <HCardBody {...props} className={cn(className)} />;
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <HCardHeader {...props} className={cn(className)} />;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <HCardFooter {...props} className={cn(className)} />;
}
