"use client";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeSwitch from "@/components/theme/ThemeSwitch";

export default function AppNavbar() {
  return (
    <Navbar isBordered maxWidth="full">
      <NavbarBrand>
        <span className="font-semibold">HoReCa SaaS</span>
      </NavbarBrand>
      <NavbarContent justify="start" className="gap-4">
        <NavbarItem><Link prefetch href="/owner">/owner</Link></NavbarItem>
        <NavbarItem><Link prefetch href="/partner">/partner</Link></NavbarItem>
        <NavbarItem><Link prefetch href="/point">/point</Link></NavbarItem>
        <NavbarItem><Link prefetch href="/employee">/employee</Link></NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end" className="items-center gap-3">
        <NavbarItem><ThemeSwitch /></NavbarItem>
        <NavbarItem><LogoutButton /></NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}


