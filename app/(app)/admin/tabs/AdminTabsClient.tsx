// app/admin/tabs/AdminTabsClient.tsx
"use client";

import {
  Tabs, Tab, Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Select, SelectItem, Button, Input
} from "@heroui/react";
import { useTransition } from "react";
import { updateUserRoleAction } from "../actions";
import type { $Enums } from "@prisma/client";

type RoleDTO = { id: string; key: string; name: string; description: string | null; usersCount?: number };
type UserDTO = { id: string; name: string | null; email: string | null; login: string | null; role: $Enums.UserRoleType; createdAt: string | Date };

const ROLE_LABEL: Record<$Enums.UserRoleType, string> = {
  PLATFORM_OWNER: "Владелец платформы",
  OWNER: "Владелец",
  PARTNER: "Партнёр",
  POINT: "Точка",
  EMPLOYEE: "Сотрудник",
};

export default function AdminTabsClient({ roles, users }: { roles: RoleDTO[]; users: UserDTO[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="p-4">
      <Tabs aria-label="Админ-настройки" variant="solid" fullWidth defaultSelectedKey="roles" className="w-full">
        <Tab key="roles" title="Роли">
          <div className="space-y-6 p-2 md:p-4">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Управление ролями</h3>
              <Card className="p-4 bg-content2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Название роли" placeholder="например: manager" isDisabled />
                  <Input label="Описание" placeholder="необязательно" isDisabled />
                  <Button isDisabled>Создать</Button>
                </div>
              </Card>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Существующие роли</h3>
              <div className="space-y-3">
                {roles.map((r) => (
                  <Card key={r.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-default-500 text-sm">{r.description ?? r.key}</div>
                    </div>
                    <div className="text-default-500 text-sm">
                      ({r.usersCount ?? 0} пользователей)
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </Tab>

        <Tab key="users" title="Пользователи">
          <div className="p-2 md:p-4">
            <Table aria-label="Пользователи">
              <TableHeader>
                <TableColumn>Имя</TableColumn>
                <TableColumn>Логин</TableColumn>
                <TableColumn>Email</TableColumn>
                <TableColumn>Роль</TableColumn>
                <TableColumn align="end">Действия</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Пользователей пока нет" items={users}>
                {(u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name ?? "—"}</TableCell>
                    <TableCell>{u.login ?? "—"}</TableCell>
                    <TableCell>{u.email ?? "—"}</TableCell>
                    <TableCell>
                      <form
                        action={(fd) => startTransition(async () => { await updateUserRoleAction(fd); })}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="userId" value={u.id} />
                        <Select name="role" aria-label="Роль" defaultSelectedKeys={[u.role]} className="min-w-[180px]">
                          {(Object.keys(ROLE_LABEL) as Array<keyof typeof ROLE_LABEL>).map((k) => (
                            <SelectItem key={k} value={k}>{ROLE_LABEL[k]}</SelectItem>
                          ))}
                        </Select>
                        <Button type="submit" size="sm" color="primary" isLoading={pending}>Сохранить</Button>
                      </form>
                    </TableCell>
                    <TableCell>—</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tab>

        <Tab key="perms" title="Разрешения"><div className="p-4 text-default-600">Раздел в разработке</div></Tab>
        <Tab key="resources" title="Ресурсы"><div className="p-4 text-default-600">Раздел в разработке</div></Tab>
        <Tab key="guide" title="Гайд"><div className="p-4 text-default-600">Раздел в разработке</div></Tab>
      </Tabs>
    </Card>
  );
}