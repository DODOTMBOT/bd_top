"use client";

import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell,
  Button
} from "@heroui/react";

type PointRow = {
  id: string;
  name: string;
  address?: string | null;
  account?: { login: string | null } | null;
};

export function PointsTable({ items }: { items: PointRow[] }) {
  const [secret, setSecret] = useState<{ pointId: string; password: string } | null>(null);
  
  useEffect(() => {
    // попытаемся прочитать короткоживущую куку, которую ставит server action при создании
    // доступ к httpOnly невозможен, поэтому используем небольшой bridge через inlined script на странице —
    // если такого нет, «секрет» просто не будет доступен (кнопка скопирует ****)
    const g = globalThis as { __POINT_ONE_TIME__?: { pointId: string; password: string } };
    if (g.__POINT_ONE_TIME__) {
      try { setSecret(g.__POINT_ONE_TIME__); } catch {}
      delete g.__POINT_ONE_TIME__;
    }
  }, []);

  return (
    <Table aria-label="Мои точки">
      <TableHeader>
        <TableColumn key="name">Название</TableColumn>
        <TableColumn key="login">Логин</TableColumn>
        <TableColumn key="password">Пароль</TableColumn>
        <TableColumn key="address">Адрес</TableColumn>
      </TableHeader>

      <TableBody
        items={items}
        emptyContent="Точек пока нет"
        loadingContent="Загрузка..."
      >
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.account?.login ?? "-"}</TableCell>
            <TableCell>
              <Button
                color="primary"
                variant="flat"
                size="sm"
                onClick={() => {
                  const value = secret && secret.pointId === item.id ? secret.password : '********';
                  navigator.clipboard.writeText(value);
                }}
              >
                Копировать
              </Button>
            </TableCell>
            <TableCell>{item.address ?? "-"}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}


