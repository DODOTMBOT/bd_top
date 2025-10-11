"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Select, SelectItem, Chip } from "@heroui/react";

type User = {
  id: string;
  email: string;
  roleKey: "owner" | "partner" | "manager" | "employee";
  pointName?: string | null;
  active?: boolean;
};

const ROLE_LABEL: Record<User["roleKey"], string> = {
  owner: "Владелец",
  partner: "Партнёр",
  manager: "Менеджер точки",
  employee: "Сотрудник",
};

export default function UsersTab(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({}); // id -> saving
  const [draft, setDraft] = useState<Record<string, User["roleKey"]>>({}); // id -> role

  useEffect(() => {
    (async () => {
      const u = await fetch("/api/admin/users").then(r => r.json());
      setUsers(u.users as User[]);
      const me = await fetch("/api/admin/me").then(r => r.json());
      setMeEmail(me?.me?.email ?? null);
    })();
  }, []);

  const rows = useMemo(() => users, [users]);

  const onChangeRole = (id: string, next: User["roleKey"]) => {
    setDraft(prev => ({ ...prev, [id]: next }));
  };

  const onSave = async (u: User) => {
    const nextRole = draft[u.id] ?? u.roleKey;
    if (nextRole === u.roleKey) return;
    setSaving(s => ({ ...s, [u.id]: true }));
    const prevUsers = users;
    // оптимистичное обновление
    setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, roleKey: nextRole } : x)));
    try {
      const res = await fetch(`/api/admin/users/${u.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleKey: nextRole }),
      });
      if (!res.ok) throw new Error("save failed");
      // успешно — зафиксировать
      setDraft(d => {
        const copy = { ...d };
        delete copy[u.id];
        return copy;
      });
    } catch {
      // откат
      setUsers(prevUsers);
    } finally {
      setSaving(s => ({ ...s, [u.id]: false }));
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Пользователи</h2>
      <div className="rounded-xl border p-4">
        <ul className="space-y-3">
          {rows.map((u) => {
            const current = draft[u.id] ?? u.roleKey;
            const isMe = meEmail && u.email === meEmail;
            return (
              <li key={u.id} className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {u.email}
                    {isMe ? <Chip size="sm" color="primary" variant="flat">Вы</Chip> : null}
                  </div>
                  <div className="text-sm text-foreground-500">
                    Роль: {ROLE_LABEL[u.roleKey]}
                    {u.pointName ? ` · Точка: ${u.pointName}` : ""}
                    {" · "}
                    {u.active ? "Активен" : "Заблокирован"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    aria-label="Выбор роли"
                    size="sm"
                    className="w-56"
                    selectedKeys={[current]}
                    onChange={(e) => onChangeRole(u.id, e.target.value as User["roleKey"])}
                  >
                    <SelectItem key="owner" value="owner">Владелец</SelectItem>
                    <SelectItem key="partner" value="partner">Партнёр</SelectItem>
                    <SelectItem key="manager" value="manager">Менеджер точки</SelectItem>
                    <SelectItem key="employee" value="employee">Сотрудник</SelectItem>
                  </Select>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    isDisabled={saving[u.id] || (draft[u.id] ?? u.roleKey) === u.roleKey}
                    isLoading={!!saving[u.id]}
                    onPress={() => onSave(u)}
                  >
                    Сохранить
                  </Button>
                </div>
              </li>
            );
          })}
          {rows.length === 0 ? <div className="text-sm text-foreground-500">Нет пользователей</div> : null}
        </ul>
      </div>
    </div>
  );
}
