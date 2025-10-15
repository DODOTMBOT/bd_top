"use client";

import { Card, Tabs, Tab } from "@heroui/react";
import PagesTab from "./PagesTab";
import PagesAccessTab from "./PagesAccessTab";
import RolesTab from "./RolesTab";
import UsersTab from "./UsersTab";
import MenuTab from "./MenuTab";
import PlansTab from "./PlansTab";
import PartnersTab from "./PartnersTab";

type PageRow = { route:string; file:string; isDynamic:boolean; protected:boolean; kind:string };

type Plan = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  priceMonthlyCents: number;
  priceYearlyCents?: number | null;
  defaultPeriod: 'month' | 'year';
  popular: boolean;
  badge?: string | null;
  includedModules?: string | null;
  limits?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Item = {
  key: "pages" | "pages-access" | "roles" | "users" | "partners" | "menu" | "subscriptions";
  title: string;
  content: JSX.Element;
};

export default function AdminShell({
  pages,
  plans,
}:{
  pages: PageRow[];
  plans: Plan[];
}) {
  const ITEMS: Item[] = [
    { key: "pages", title: "Страницы", content: <PagesTab /> },
    { key: "pages-access", title: "Доступ к страницам", content: <PagesAccessTab /> },
    { key: "roles", title: "Роли", content: <RolesTab /> },
    { key: "users", title: "Пользователи", content: <UsersTab /> },
    { key: "partners", title: "Партнеры", content: <PartnersTab /> },
    { key: "menu", title: "Меню", content: <MenuTab /> },
    { key: "subscriptions", title: "Подписка", content: <PlansTab /> },
  ];

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <Tabs
          aria-label="Админ-вкладки"
          items={ITEMS}
          variant="solid"
          color="primary"
          radius="lg"
          size="md"
          className="w-full"
          defaultSelectedKey="pages"
        >
          {(item) => (
            <Tab key={item.key} title={item.title}>
              <div className="mt-4">{item.content}</div>
            </Tab>
          )}
        </Tabs>
      </Card>
    </div>
  );
}
