// app/(app)/health/HealthLogForm.tsx
"use client";

import { useState, useTransition } from "react";
import { createHealthLog } from "./actions";

type Employee = { id: string; name: string; login: string };

export function HealthLogForm(props: { employees: Employee[]; defaultManager?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    employeeId: "",
    employeeName: "",
    temperature: "",
    symptoms: "",
    wounds: "",
    firstAid: "",
    allowedToWork: true,
    managerName: props.defaultManager ?? "",
    notes: "",
  });

  const onEmployeeChange = (id: string) => {
    const emp = props.employees.find(e => e.id === id);
    setForm(f => ({ ...f, employeeId: id, employeeName: emp?.name ?? "" }));
  };

  const submit = () => {
    setError(null);
    start(async () => {
      try {
        const res = await createHealthLog({
          ...form,
          allowedToWork: !!form.allowedToWork,
        });
        if (res?.ok) {
          window.location.href = "/health";
        }
      } catch (e: any) {
        setError(e?.message ?? "Ошибка сохранения");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Дата осмотра</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Сотрудник</label>
          <select
            value={form.employeeId}
            onChange={(e) => onEmployeeChange(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">— выберите сотрудника —</option>
            {props.employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} ({e.login})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Температура (°C)</label>
          <input
            inputMode="decimal"
            placeholder="36.6"
            value={form.temperature}
            onChange={(e) => setForm({ ...form, temperature: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Порезы/ожоги</label>
          <input
            value={form.wounds}
            onChange={(e) => setForm({ ...form, wounds: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Например: мелкий порез на пальце"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Оказанная помощь</label>
          <input
            value={form.firstAid}
            onChange={(e) => setForm({ ...form, firstAid: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Перекись, пластырь и т.п."
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">Жалобы/симптомы</label>
          <textarea
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            className="w-full border rounded-md px-3 py-2 min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Допущен к работе</label>
          <div className="flex items-center gap-2">
            <input
              id="allowed"
              type="checkbox"
              checked={form.allowedToWork}
              onChange={(e) => setForm({ ...form, allowedToWork: e.target.checked })}
            />
            <label htmlFor="allowed">Да</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Проверил (ФИО)</label>
          <input
            value={form.managerName}
            onChange={(e) => setForm({ ...form, managerName: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Менеджер смены"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Примечания</label>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Опционально"
          />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {pending ? "Сохранение…" : "Сохранить запись"}
        </button>
        <a href="/health" className="px-4 py-2 rounded-lg border">Отмена</a>
      </div>
    </div>
  );
}
