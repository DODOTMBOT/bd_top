"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { createPointAction } from "./actions";
import type { Result as CreatePointResult } from "./actions";
import { Input, Button, Alert } from "@/components/ui";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      color="primary"
      isLoading={pending}
      isDisabled={pending}
    >
      {pending ? 'Создание...' : 'Создать'}
    </Button>
  );
}

export default function NewPointForm() {
  const router = useRouter();
  const [state, setState] = useState<CreatePointResult | null>(null);

  return (
    <form
      id="new-point-form"
      className="grid gap-4 sm:grid-cols-2"
      autoComplete="off"
      action={async (fd) => {
        const res = await createPointAction(fd);
        setState(res);
        if (res.ok) {
          const form = document.getElementById("new-point-form") as HTMLFormElement | null;
          form?.reset();
          router.refresh();
        }
      }}
    >
      <Input
        id="name"
        name="name"
        type="text"
        label="Название"
        isRequired
        placeholder="Введите название точки"
      />
      
      <Input
        id="login"
        name="login"
        type="text"
        label="Логин"
        isRequired
        autoComplete="username"
        placeholder="Введите логин"
      />
      
      <Input
        id="password"
        name="password"
        type="password"
        label="Пароль"
        isRequired
        autoComplete="new-password"
        placeholder="Введите пароль"
        className="sm:col-span-2"
      />
      
      <Input
        id="address"
        name="address"
        type="text"
        label="Адрес"
        placeholder="Введите адрес (необязательно)"
        className="sm:col-span-2"
      />
      
      {state && !state.ok && (
        <Alert color="danger" title="Ошибка" description={state.message} className="sm:col-span-2" />
      )}
      
      <div className="sm:col-span-2">
        <SubmitBtn />
      </div>
    </form>
  );
}


