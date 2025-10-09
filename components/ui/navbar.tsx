"use client";
import { Navbar as HNavbar, NavbarBrand as HNavbarBrand, NavbarContent as HNavbarContent, NavbarItem as HNavbarItem } from "@heroui/react";
import { cn } from "@/lib/cn";

export type NavbarProps = React.ComponentProps<typeof HNavbar>;
export type NavbarBrandProps = React.ComponentProps<typeof HNavbarBrand>;
export type NavbarContentProps = React.ComponentProps<typeof HNavbarContent>;
export type NavbarItemProps = React.ComponentProps<typeof HNavbarItem>;

export function Navbar({ className, ...props }: NavbarProps) {
  return <HNavbar {...props} className={cn(className)} />;
}

export function NavbarBrand({ className, ...props }: NavbarBrandProps) {
  return <HNavbarBrand {...props} className={cn(className)} />;
}

export function NavbarContent({ className, ...props }: NavbarContentProps) {
  return <HNavbarContent {...props} className={cn(className)} />;
}

export function NavbarItem({ className, ...props }: NavbarItemProps) {
  return <HNavbarItem {...props} className={cn(className)} />;
}
