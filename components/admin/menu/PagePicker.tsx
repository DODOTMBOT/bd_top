'use client';
import { useEffect, useState, useMemo } from 'react';
import { Button, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';

type PageOption = { id: string; label: string; path: string };

export default function PagePicker({ onAdd }: { onAdd: (items: PageOption[]) => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<PageOption[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/menu/available', { cache: 'no-store' });
      const data = await res.json();
      setOptions(data.items ?? []);
    } catch (e:any) {
      setError('Не удалось загрузить список страниц');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selectedItems = useMemo(
    () => options.filter(o => selected.has(o.path)),
    [selected, options]
  );

  const handleAdd = async () => {
    if (!selectedItems.length) return;
    await onAdd(selectedItems);  // твоя логика добавления в меню (создание записей в Menu)
    setSelected(new Set());
    await load(); // обновить список доступных
  };

  return (
    <div className="flex items-center gap-3">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat" isDisabled={loading || !!error}>
            {loading ? <span className="flex items-center gap-2"><Spinner size="sm" /> Загрузка…</span>
                     : (selectedItems.length ? `Выбрано: ${selectedItems.length}` : 'Выбрать страницы')}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Доступные страницы"
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={(keys) => setSelected(keys as Set<string>)}
          items={options}
          emptyContent={error ? error : (loading ? 'Загрузка…' : 'Нет доступных страниц')}
        >
          {(item: PageOption) => (
            <DropdownItem key={item.path} description={item.path}>
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>

      <Button color="primary" onPress={handleAdd} isDisabled={!selectedItems.length}>
        Добавить
      </Button>
    </div>
  );
}