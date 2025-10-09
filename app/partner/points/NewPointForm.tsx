"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { createPointAction } from "./actions";
import type { Result as CreatePointResult } from "./actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Создание...' : 'Создать'}
    </button>
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
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Название *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">
          Логин *
        </label>
        <input
          id="login"
          name="login"
          type="text"
          required
          autoComplete="username"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="sm:col-span-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Пароль *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="sm:col-span-2">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Адрес
        </label>
        <input
          id="address"
          name="address"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {state && !state.ok && (
        <div className="text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded sm:col-span-2">
          {state.message}
        </div>
      )}
      
      <div className="sm:col-span-2">
        <SubmitBtn />
      </div>
    </form>
  );
}


