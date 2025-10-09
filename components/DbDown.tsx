"use client";

import { Alert } from "@nextui-org/react";

export default function DbDown({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Alert title="Сервис временно недоступен" description="Не удаётся подключиться к базе данных. Повторите попытку позже." />
    </div>
  );
}


