"use client";
import React, { useState } from "react";
import { Button } from "@heroui/react";
import AccessModal from "./AccessModal";

type Role = {
  id: string;        // ключ роли для БД
  name: string;      // отображаемое имя
  description?: string;
  pagesAccessCount?: number;
};

const ROLES: Role[] = [
  { id: "owner", name: "Владелец", description: "Полный доступ", pagesAccessCount: 999 },
  { id: "partner", name: "Партнёр", description: "Управление точками", pagesAccessCount: 42 },
  { id: "manager", name: "Менеджер точки", description: "Операционные функции", pagesAccessCount: 21 },
  { id: "employee", name: "Сотрудник", description: "Исполнение задач", pagesAccessCount: 7 },
];

export default function RolesTab(): JSX.Element {
  const [openRole, setOpenRole] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Роли</h2>
      <div className="rounded-xl border p-4">
        <ul className="space-y-2">
          {ROLES.map((r) => (
            <li key={r.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{r.name}</div>
                {r.description ? (
                  <div className="text-sm text-foreground-500">{r.description}</div>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-foreground-500">
                  Доступов к страницам: {r.pagesAccessCount ?? 0}
                </div>
                <Button size="sm" variant="flat" onPress={() => setOpenRole(r.id)}>
                  Доступ
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AccessModal
        isOpen={openRole !== null}
        onClose={() => setOpenRole(null)}
        roleKey={openRole ?? "employee"}
      />
    </div>
  );
}
