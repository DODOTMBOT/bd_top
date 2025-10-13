'use client'
import React from "react"
import { HeroUIProvider } from '@heroui/react'
import { DialogCenterProvider } from '@/components/ui/DialogCenter'
import { SessionProvider } from "next-auth/react"
import { MenuProvider } from "@/src/contexts/MenuContext"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <DialogCenterProvider>
        <SessionProvider>
          <MenuProvider>{children}</MenuProvider>
        </SessionProvider>
      </DialogCenterProvider>
    </HeroUIProvider>
  )
}
