import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function SiteHeader() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role as string | undefined;

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <header className="border-b px-4 py-3 flex items-center gap-4">
      <Link href="/" className="font-semibold">HoReCa SaaS</Link>
      <nav className="flex gap-3 text-sm">
        <Link href="/owner">/owner</Link>
        <Link href="/partner">/partner</Link>
        <Link href="/point">/point</Link>
        <Link href="/employee">/employee</Link>
      </nav>
      <div className="ml-auto flex items-center gap-3 text-sm">
        {session?.user ? (
          <>
            <span>{session.user.email}{role ? ` (${role})` : ""}</span>
            <form action={doSignOut}>
              <button type="submit" className="border rounded px-2 py-1">Выйти</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">Войти</Link>
            <Link href="/register">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
}


