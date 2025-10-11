"use client";

import { Card, Tabs, Tab } from "@heroui/react";
import PagesTab from "./PagesTab";
import RolesTab from "./RolesTab";
import UsersTab from "./UsersTab";

type PageRow = { route:string; file:string; isDynamic:boolean; protected:boolean; kind:string };

type Item = {
  key: "pages" | "roles" | "users";
  title: string;
  content: JSX.Element;
};

export default function AdminShell({
  pages,
}:{
  pages: PageRow[];
}) {
  const ITEMS: Item[] = [
    { key: "pages", title: "Страницы", content: <PagesTab pages={pages} /> },
    { key: "roles", title: "Роли", content: <RolesTab /> },
    { key: "users", title: "Пользователи", content: <UsersTab /> },
  ];

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <Tabs aria-label="Admin Tabs" color="primary" variant="underlined" defaultSelectedKey="pages" items={ITEMS}>
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
