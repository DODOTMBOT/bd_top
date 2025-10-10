export const dynamic = "force-dynamic";
export default function Home() {
  return (
    <div className="space-y-4">
      <div className="rounded-large bg-content2 p-6">
        <div className="text-xl font-semibold mb-1">Добро пожаловать</div>
        <div className="text-default-500 text-sm">Выберите раздел слева. Ваши метрики и профиль — справа.</div>
      </div>
      {/* тут можно подключить графики/таблицы позже */}
    </div>
  );
}
