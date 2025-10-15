"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  return (
    <Button
      variant="outline"
      className="w-full mt-2"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Выйти
    </Button>
  )
}