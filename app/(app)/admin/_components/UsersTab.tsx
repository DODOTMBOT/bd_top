"use client";
import React from "react";

type User = {
  id: string;
  email: string;
  role: string;
  pointName?: string;
  active?: boolean;
};

const MOCK_USERS: User[] = [
  { id: "u1", email: "owner@example.com", role: "Владелец", active: true },
  { id: "u2", email: "partner@example.com", role: "Партнёр", pointName: "Cafe Aurora", active: true },
  { id: "u3", email: "manager@example.com", role: "Менеджер точки", pointName: "Bar Nebula", active: true },
  { id: "u4", email: "staff@example.com", role: "Сотрудник", pointName: "Cafe Aurora", active: false },
];

export default function UsersTab(): JSX.Element {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Пользователи</h2>
      <div className="rounded-xl border p-4">
        <ul className="space-y-2">
          {MOCK_USERS.map((u) => (
            <li key={u.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{u.email}</div>
                <div className="text-sm text-foreground-500">
                  Роль: {u.role}
                  {u.pointName ? ` · Точка: ${u.pointName}` : ""}
                </div>
              </div>
              <div className="text-sm">
                {u.active ? "Активен" : "Заблокирован"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
