import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function BlockedPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Проверяем статус пользователя
  const user = await (prisma as any).user.findUnique({
    where: { id: session.user.id },
    select: { isBlocked: true, blockReason: true, name: true, email: true }
  });

  if (!user?.isBlocked) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Аккаунт заблокирован
          </h1>
          <p className="text-gray-600 mb-4">
            Ваш аккаунт был заблокирован администратором
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Информация об аккаунте:</h2>
          <p className="text-sm text-gray-600">
            <strong>Имя:</strong> {user.name || "Не указано"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {user.email}
          </p>
          {user.blockReason && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Причина блокировки:</strong> {user.blockReason}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Для разблокировки аккаунта обратитесь к администратору системы
          </p>
          <button
            onClick={() => window.location.href = "/logout"}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}
