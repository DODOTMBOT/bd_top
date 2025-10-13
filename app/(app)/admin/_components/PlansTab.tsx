'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Textarea, Chip, Switch, Modal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, useDisclosure, Alert
} from "@heroui/react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly: number;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
};

const rub = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₽";

export default function PlansTab() {
  const router = useRouter();
  const [rows, setRows] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  // модалка редактирования / создания
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/plans?ts=" + Date.now(), { cache: "no-store" });
      const txt = await r.text();
      if (!r.ok) throw new Error(txt || `HTTP ${r.status}`);
      const parsed = txt ? JSON.parse(txt) : [];
      setRows(Array.isArray(parsed) ? parsed : []);   // гарантия массива
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing({
      id: "",
      name: "",
      slug: "",
      description: "",
      priceMonthly: 0,
      priceYearly: 0,
      isPopular: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    onOpen();
  }

  function openEdit(p: Plan) {
    setEditing({ ...p });
    onOpen();
  }

  async function save() {
    if (!editing) return;
    const method = editing.id ? "PUT" : "POST";
    const r = await fetch("/api/admin/plans", { method, headers:{ "Content-Type":"application/json" }, body: JSON.stringify(editing) });
    const txt = await r.text();
    if (!r.ok) throw new Error(txt || `HTTP ${r.status}`);
    await load();
    router.refresh();
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 1800);
    onOpenChange(false);
  }

  async function remove(id: string) {
    const r = await fetch("/api/admin/plans", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const txt = await r.text();
    if (!r.ok) throw new Error(txt || `HTTP ${r.status}`);
    await load();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Подписки (тарифы)</h2>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Plus size={16} />} onPress={openCreate}>
            Создать план
          </Button>
          <Button isDisabled>Импорт/Экспорт</Button>
        </div>
      </div>

      <Table aria-label="Список тарифов" isStriped removeWrapper className="border rounded-xl">
        <TableHeader>
          <TableColumn>НАЗВАНИЕ</TableColumn>
          <TableColumn>SLUG</TableColumn>
          <TableColumn>ЦЕНА</TableColumn>
          <TableColumn>ПОПУЛЯРНЫЙ</TableColumn>
          <TableColumn>АКТИВЕН</TableColumn>
          <TableColumn>ДАТА</TableColumn>
          <TableColumn>ДЕЙСТВИЯ</TableColumn>
        </TableHeader>
        <TableBody items={rows} isLoading={loading} emptyContent="Планов нет.">
          {(p: Plan) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="font-medium">{p.name}</div>
                {p.description ? <div className="text-xs text-gray-500">{p.description}</div> : null}
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat">{p.slug}</Chip>
              </TableCell>
              <TableCell>
                <div className="leading-5">
                  <div>{rub(p.priceMonthly)} / мес</div>
                  <div className="text-xs text-gray-500">{rub(p.priceYearly)} / год</div>
                </div>
              </TableCell>
              <TableCell>
                <Chip color={p.isPopular ? "primary" : "default"} variant="flat">
                  {p.isPopular ? "ТОП" : "—"}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip color={p.isActive ? "success" : "danger"} variant="flat">
                  {p.isActive ? "Активен" : "Отключен"}
                </Chip>
              </TableCell>
              <TableCell>{new Date(p.createdAt).toLocaleDateString("ru-RU")}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" startContent={<Pencil size={16} />} onPress={() => openEdit(p)}>
                    Редактировать
                  </Button>
                  <Button size="sm" variant="flat" color="danger" startContent={<Trash2 size={16} />} onPress={() => remove(p.id)}>
                    Удалить
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Модалка создания/редактирования */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editing?.id ? "Редактировать план" : "Создать план"}</ModalHeader>
              <ModalBody>
                <Input label="Название" value={editing?.name ?? ""} onChange={(e) => setEditing((s) => s && ({ ...s, name: e.target.value }))} />
                <Input label="Slug" value={editing?.slug ?? ""} onChange={(e) => setEditing((s) => s && ({ ...s, slug: e.target.value }))} />
                <Textarea label="Описание" value={editing?.description ?? ""} onChange={(e) => setEditing((s) => s && ({ ...s, description: e.target.value }))} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input type="number" label="Цена / месяц (₽)" value={String(editing?.priceMonthly ?? 0)} onChange={(e) => setEditing((s) => s && ({ ...s, priceMonthly: Number(e.target.value || 0) }))} />
                  <Input type="number" label="Цена / год (₽)" value={String(editing?.priceYearly ?? 0)} onChange={(e) => setEditing((s) => s && ({ ...s, priceYearly: Number(e.target.value || 0) }))} />
                </div>
                <div className="flex gap-6">
                  <Switch isSelected={!!editing?.isPopular} onValueChange={(v) => setEditing((s) => s && ({ ...s, isPopular: v }))}>Популярный</Switch>
                  <Switch isSelected={!!editing?.isActive} onValueChange={(v) => setEditing((s) => s && ({ ...s, isActive: v }))}>Активен</Switch>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose} variant="flat">Отмена</Button>
                <Button color="primary" onPress={save}>Сохранить</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Центрированное подтверждение, как на других вкладках */}
      <Modal isOpen={toastOpen} onOpenChange={setToastOpen} placement="center" backdrop="blur">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader>Готово</ModalHeader>
              <ModalBody>
                <Alert color="success" variant="flat" title="Изменения сохранены" />
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => close(false)}>OK</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
