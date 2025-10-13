// app/partner/points/new/CreatePointForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

export default function CreatePointForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDoneId(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/partner/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "LOGIN_TAKEN") setError("Такой логин уже существует.");
        else if (data?.error === "VALIDATION") setError("Проверьте корректность данных.");
        else if (res.status === 403) setError("Доступ запрещён. Войдите в систему как партнер.");
        else if (res.status === 401) setError("Необходимо войти в систему.");
        else setError(`Ошибка сервера: ${data?.error || 'Неизвестная ошибка'}`);
        return;
      }
      setDoneId(data.pointId);
      setName(""); setAddress(""); setLogin(""); setPassword("");
    } catch {
      setError("Сеть недоступна.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Название заведения"
            placeholder="Напр.: Кофейня «Точка»"
            value={name}
            onChange={(e) => setName(e.target.value)}
            isRequired
          />
          <Input
            label="Адрес"
            placeholder="Город, улица, дом"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            isRequired
          />
          <Input
            label="Логин для входа точки"
            placeholder="point_001"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            description="Только латиница, цифры, точки, дефис и подчёркивание"
            isRequired
          />
          <Input
            label="Пароль для входа точки"
            type="password"
            placeholder="Минимум 8 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {doneId && <div className="text-green-700 text-sm">Точка создана (ID: {doneId}).</div>}
          <Button type="submit" isDisabled={submitting}>
            {submitting ? "Создание..." : "Создать точку"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
