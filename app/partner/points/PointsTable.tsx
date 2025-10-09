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
    <Table aria-label="Список точек">
      <TableHeader>
        <TableColumn>Название</TableColumn>
        <TableColumn>Логин</TableColumn>
        <TableColumn>Пароль</TableColumn>
        <TableColumn>Адрес</TableColumn>
      </TableHeader>
      <TableBody>
        {points.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.login || ''}</TableCell>
            <TableCell>
              <Button
                color="primary"
                variant="flat"
                size="sm"
                onClick={() => {
                  const value = secret && secret.pointId === p.id ? secret.password : '********';
                  navigator.clipboard.writeText(value);
                }}
              >
                Копировать
              </Button>
            </TableCell>
            <TableCell>{p.address || ''}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


