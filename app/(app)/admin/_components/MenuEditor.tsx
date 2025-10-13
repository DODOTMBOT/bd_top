"use client";
import { useEffect, useState } from "react";
import { Button, Input, Select, SelectItem, Card, CardBody, CardHeader } from "@heroui/react";

type Page = { id: string; name: string; path: string };
type MenuItem = {
  id: string;
  pageId: string;
  label: string;
  order: number;
  page: Page;
};

export default function MenuEditor() {
  const [pages, setPages] = useState<Page[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>("");

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [mRes, pRes] = await Promise.all([
        fetch("/api/admin/menu", { cache: "no-store" }),
        fetch("/api/admin/pages", { cache: "no-store" }),
      ]);
      const m = await mRes.json();
      const p = await pRes.json();
      setMenu(m);
      setPages(p);
    } catch (e: any) {
      setError("Ошибка загрузки меню");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function addSelected() {
    const page = pages.find(p => p.id === selectedPageId);
    if (!page) return;
    await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: page.id, label: page.name }),
    });
    await loadAll();
    setSelectedPageId("");
  }

  async function saveMenu() {
    const payload = menu.map((m, idx) => ({
      id: m.id,
      pageId: m.pageId,
      label: m.label,
      order: idx,
    }));
    const res = await fetch("/api/admin/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? "Ошибка сохранения");
    }
  }

  function setLabel(id: string, label: string) {
    setMenu(prev => prev.map(i => (i.id === id ? { ...i, label } : i)));
  }

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Управление меню</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Добавление новой страницы */}
          <div className="flex gap-4 items-end">
            <Select
              label="Добавить страницу в меню"
              placeholder="Выберите страницу"
              selectedKeys={selectedPageId ? [selectedPageId] : []}
              onSelectionChange={(keys) => setSelectedPageId(Array.from(keys)[0] as string)}
              className="flex-1"
            >
              {pages.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  {page.name} ({page.path})
                </SelectItem>
              ))}
            </Select>
            <Button 
              color="primary" 
              onPress={addSelected}
              isDisabled={!selectedPageId}
            >
              Добавить
            </Button>
          </div>

          {pages.length === 0 && (
            <div className="text-center text-foreground-500 py-4">
              Нет доступных страниц для добавления в меню
            </div>
          )}

          {/* Список пунктов меню */}
          <div className="space-y-3">
            <h3 className="font-medium">Текущее меню</h3>
            {menu.map((item, index) => (
              <div key={item.id} className="flex gap-4 items-center p-3 border rounded-lg">
                <div className="text-sm text-foreground-500 w-8">
                  {index + 1}
                </div>
                <Input
                  label="Название в меню"
                  value={item.label}
                  onValueChange={(value) => setLabel(item.id, value)}
                  className="flex-1"
                />
                <div className="text-sm text-foreground-500 min-w-[200px]">
                  <div>Страница: {item.page.name}</div>
                  <div>Путь: {item.page.path}</div>
                </div>
              </div>
            ))}
          </div>

          {menu.length === 0 && (
            <div className="text-center text-foreground-500 py-4">
              Меню пусто. Добавьте страницы выше.
            </div>
          )}

          {/* Кнопка сохранения */}
          {menu.length > 0 && (
            <div className="flex justify-end">
              <Button 
                color="primary" 
                onPress={saveMenu}
                className="px-6"
              >
                Сохранить меню
              </Button>
            </div>
          )}

          {error && (
            <div className="text-danger text-sm">
              {error}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}