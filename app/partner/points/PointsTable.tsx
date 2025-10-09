"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@/components/ui";

type Point = { id: string; name: string; login?: string; address?: string };

export default function PointsTable({ points }: { points: Point[] }) {
  const [secret, setSecret] = useState<{ pointId: string; password: string } | null>(null);
  
  useEffect(() => {
    // попытаемся прочитать короткоживущую куку, которую ставит server action при создании
    // доступ к httpOnly невозможен, поэтому используем небольшой bridge через inlined script на странице —
    // если такого нет, «секрет» просто не будет доступен (кнопка скопирует ****)
    const g: any = (globalThis as any);
    if (g.__POINT_ONE_TIME__) {
      try { setSecret(g.__POINT_ONE_TIME__); } catch {}
      delete g.__POINT_ONE_TIME__;
    }
  }, []);

  if (!Array.isArray(points) || points.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Пока нет точек</p>
      </div>
    );
  }

  return (
    <Table aria-label="Список точек" items={points}>
      <TableHeader>
        <TableColumn key="name">Название</TableColumn>
        <TableColumn key="login">Логин</TableColumn>
        <TableColumn key="password">Пароль</TableColumn>
        <TableColumn key="address">Адрес</TableColumn>
      </TableHeader>
      <TableBody>
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.login || ''}</TableCell>
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
            <TableCell>{item.address || ''}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}


