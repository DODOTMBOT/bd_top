"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import AccessModal from "./AccessModal";

type Role = {
  id: "owner" | "partner" | "manager" | "employee";
  name: string;
  description?: string;
};
type Summary = { allowedCount: number; totalCount: number };

const ROLES: Role[] = [
  { id: "owner", name: "Владелец", description: "Полный доступ" },
  { id: "partner", name: "Партнёр", description: "Управление точками" },
  { id: "manager", name: "Менеджер точки", description: "Операционные функции" },
  { id: "employee", name: "Сотрудник", description: "Исполнение задач" },
];

export default function RolesTab(): JSX.Element {
  const [openRole, setOpenRole] = useState<Role["id"] | null>(null);
  const [stats, setStats] = useState<Record<Role["id"], Summary>>({
    owner: { allowedCount: 0, totalCount: 0 },
    partner: { allowedCount: 0, totalCount: 0 },
    manager: { allowedCount: 0, totalCount: 0 },
    employee: { allowedCount: 0, totalCount: 0 },
  });

  const loadOne = async (role: Role["id"]) => {
    const res = await fetch(`/api/admin/access/summary?role=${role}`, { cache: 'no-store' });
    let data = { allowedCount: 0, totalCount: 0 };

    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      try { data = await res.json(); } catch { /* пустое тело — оставляем дефолт */ }
    } else {
      console.warn('/api/admin/access/summary non-JSON or !ok', res.status);
    }

    setStats((s) => ({
      ...s,
      [role]: {
        allowedCount: Number(data.allowedCount) || 0,
        totalCount: Number(data.totalCount) || 0,
      },
    }));
  };

  useEffect(() => {
    ROLES.forEach(r => { void loadOne(r.id); });
  }, []);

  // при закрытии модалки — обновить счётчик
  const onCloseModal = () => {
    if (openRole) void loadOne(openRole);
    setOpenRole(null);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Роли</h2>
      <div className="rounded-xl border p-4">
        <ul className="space-y-2">
          {ROLES.map((r) => {
            const s = stats[r.id];
            return (
              <li key={r.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.description ? <div className="text-sm text-foreground-500">{r.description}</div> : null}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-foreground-500">
                    Доступов к страницам: {s.allowedCount} / {s.totalCount}
                  </div>
                  <Button size="sm" variant="flat" onPress={() => setOpenRole(r.id)}>
                    Доступ
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <AccessModal
        isOpen={openRole !== null}
        onClose={onCloseModal}
        roleKey={openRole ?? "employee"}
      />
    </div>
  );
}
