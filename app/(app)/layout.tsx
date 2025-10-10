import AppShell from "@/components/layout/AppShell";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    login: session?.user?.login ?? null,
    role: session?.user?.role ?? null,
  };

  return <AppShell user={user}>{children}</AppShell>;
}
