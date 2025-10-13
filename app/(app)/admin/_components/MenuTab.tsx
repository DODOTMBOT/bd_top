// app/(app)/admin/_components/MenuTab.tsx
'use client';

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Alert
} from "@heroui/react";
import {ArrowUp, ArrowDown, Pencil, Trash2, Save, X} from "lucide-react";

type NavItem = { id: string; label: string; path: string; order: number };

export default function MenuTab() {
  const router = useRouter();
  const [rows, setRows] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(false);

  // редактирование
  const [editingId, setEditingId] = useState<string|null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftPath, setDraftPath] = useState("");

  // создание
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState("");

  // подтверждение
  const [okOpen, setOkOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string|null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/menu?ts="+Date.now(), {cache:"no-store"});
      const txt = await r.text();
      const data: NavItem[] = txt ? JSON.parse(txt) : [];
      setRows(Array.isArray(data) ? data.sort((a,b)=>a.order-b.order) : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // START EDIT — НИЧЕГО не грузим и не refresh тут
  function startEdit(item: NavItem) {
    setEditingId(item.id);
    setDraftLabel(item.label ?? "");
    setDraftPath(item.path ?? "");
  }
  function cancelEdit() {
    setEditingId(null);
  }

  function move(id: string, dir: -1|1) {
    setRows(prev => {
      const i = prev.findIndex(x=>x.id===id);
      const j = i+dir;
      if (i<0 || j<0 || j>=prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy.map((x, idx)=>({...x, order: idx}));
    });
  }

  async function saveAll() {
    const payload = rows.map((r, idx) => ({...r, order: idx}));
    const res = await fetch("/api/admin/menu", {
      method: "PUT", headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || "save failed");
    const fresh: NavItem[] = txt ? JSON.parse(txt) : payload;
    setRows(fresh.sort((a,b)=>a.order-b.order));
    setEditingId(null);
    router.refresh();     // обновить Sidebar (server component)
    setOkOpen(true);
    setTimeout(()=>setOkOpen(false), 1500);
  }

  async function add() {
    if (!newLabel.trim() || !newPath.trim()) return;
    await fetch("/api/admin/menu", {
      method:"POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({label:newLabel.trim(), path:newPath.trim()}),
    });
    setNewLabel(""); setNewPath("");
    await load();
    router.refresh();
  }

  async function remove(id: string) {
    await fetch("/api/admin/menu", {
      method:"DELETE", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({id}),
    });
    await load();
    router.refresh();
  }

  // применить драфт в локальном стейте (без апи)
  function applyDraftRow() {
    if (!editingId) return;
    setRows(prev => prev.map(x => x.id === editingId ? {...x, label: draftLabel, path: draftPath} : x));
    setEditingId(null);
  }

  function askRemove(id: string) {
    setConfirmId(id);
    setConfirmOpen(true);
  }

  async function confirmRemove() {
    if (!confirmId) return;
    await fetch("/api/admin/menu", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: confirmId }),
    });
    setConfirmOpen(false);
    setConfirmId(null);
    await load();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* форма создания */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
        <Input size="sm" label="Название" value={newLabel} onChange={e=>setNewLabel(e.target.value)} />
        <Input size="sm" label="Путь" value={newPath} onChange={e=>setNewPath(e.target.value)} />
        <Button color="primary" onPress={add}>Добавить</Button>
      </div>

      {/* диагностика */}
      <div className="text-xs text-gray-500">
        editingId: {String(editingId || "null")}
      </div>

      {/* ВРЕМЕННО вместо <Table> рендери это: */}
      <ul className="space-y-2">
        {rows.map((item) => {
          console.log("render row", item.id, "editingId", editingId);
          return (
            <li key={item.id} className="flex items-center gap-3 border rounded-lg p-2">
              <div className="w-8 text-gray-500">{rows.findIndex(r=>r.id===item.id)+1}</div>

              <div className="flex-1">
                {editingId === item.id
                  ? <Input size="sm" autoFocus value={draftLabel} onChange={e=>setDraftLabel(e.target.value)} />
                  : <span>{item.label}</span>}
              </div>

              <div className="flex-1">
                {editingId === item.id
                  ? <Input size="sm" value={draftPath} onChange={e=>setDraftPath(e.target.value)} />
                  : <span className="text-gray-600">{item.path}</span>}
              </div>

              <div className="flex gap-2">
                {editingId === item.id ? (
                  <>
                    <Button size="sm" color="primary" onPress={applyDraftRow}>OK</Button>
                    <Button size="sm" variant="flat" onPress={cancelEdit}>Отмена</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="flat" onPress={() => startEdit(item)}>✏️</Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => askRemove(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-end gap-3">
        <Button color="primary" onPress={saveAll}>Сохранить</Button>
      </div>

      {/* центрированный Alert-модал */}
      <Modal isOpen={okOpen} onOpenChange={setOkOpen} placement="center" backdrop="blur">
        <ModalContent>
          {close => (
            <>
              <ModalHeader>Готово</ModalHeader>
              <ModalBody><Alert color="success" variant="flat" title="Изменения сохранены" /></ModalBody>
              <ModalFooter><Button color="primary" onPress={()=>close(false)}>OK</Button></ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* модал подтверждения удаления */}
      <Modal isOpen={confirmOpen} onOpenChange={setConfirmOpen} placement="center" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Удалить пункт меню?</ModalHeader>
              <ModalBody>Действие необратимо.</ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={() => { setConfirmOpen(false); setConfirmId(null); }}>
                  Отмена
                </Button>
                <Button color="danger" onPress={confirmRemove}>
                  Удалить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}