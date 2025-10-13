// app/partner/points/new/page.tsx
import { requireRole } from "@/lib/auth";
import CreatePointForm from "./CreatePointForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const partner = await requireRole("PARTNER");
  if (!partner) {
    redirect("/login");
  }
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Создать торговую точку</h1>
      <CreatePointForm />
    </div>
  );
}
