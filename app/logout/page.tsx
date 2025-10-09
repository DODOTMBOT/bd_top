"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/login", redirect: true });
  }, []);
  return <div className="p-6 text-sm text-gray-600">Выходим из аккаунта…</div>;
}


