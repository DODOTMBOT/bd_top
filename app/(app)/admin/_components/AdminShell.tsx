"use client";

import { ReactNode } from "react";
import { Card, Tabs, Tab } from "@heroui/react";
import PagesTab from "./PagesTab";

type PageRow = { route:string; file:string; isDynamic:boolean; protected:boolean; kind:string };

export default function AdminShell({
  pages,
}:{
  pages: PageRow[];
}) {
  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <Tabs aria-label="Admin Tabs" color="primary" variant="underlined" defaultSelectedKey="pages">
          <Tab key="pages" title="Страницы">
            <PagesTab
              pages={pages}
            />
          </Tab>
          {/* Дополнительные вкладки можно вернуть позже */}
        </Tabs>
      </Card>
    </div>
  );
}
