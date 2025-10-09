"use client";

import { Button } from "@nextui-org/react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <Button
      size="sm"
      variant="flat"
      onPress={() => signOut({ callbackUrl: "/login", redirect: true })}
    >
      Выйти
    </Button>
  );
}


