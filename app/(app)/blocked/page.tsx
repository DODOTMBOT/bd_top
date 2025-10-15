import { checkAccess } from "@/lib/checkAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlockedPage() {
  await checkAccess("/blocked");
  
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Доступ запрещён</h1>
      <p className="text-gray-500">У вашей роли нет прав на просмотр этой страницы.</p>
    </div>
  )
}