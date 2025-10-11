"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox } from "@heroui/react";

type Rule = { path: string; allowed: boolean };
type Node = {
  type: "folder" | "page";
  name: string;
  path: string;
  children?: Node[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  roleKey: string;
};

// вспомогательные функции
function flattenPages(nodes: Node[]): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    if (n.type === "page") out.push(n.path);
    if (n.type === "folder" && n.children) out.push(...flattenPages(n.children));
  }
  return out;
}
function folderState(folder: Node, allowedSet: Set<string>): "all" | "some" | "none" {
  const pages = flattenPages([folder]);
  if (pages.length === 0) return "none";
  let yes = 0;
  for (const p of pages) if (allowedSet.has(p)) yes++;
  if (yes === 0) return "none";
  if (yes === pages.length) return "all";
  return "some";
}

export default function AccessModal({ isOpen, onClose, roleKey }: Props): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [dbDown, setDbDown] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const allowedSet = useMemo(() => new Set(rules.filter(r => r.allowed).map(r => r.path)), [rules]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setLoading(true);
      setDbDown(false);
      try {
        const raw = await fetch("/api/admin/nodes").then(r => r.json());
        const items = Array.isArray(raw?.nodes) ? raw.nodes : Array.isArray(raw) ? raw : [];

        const pages = items
          .filter((x) => (x.type ?? x.kind) === "page" || x.path || x.url)
          .map((x) => ({
            type: "page" as const,
            name: String(x.name ?? x.title ?? ""),
            path: String(x.path ?? x.url ?? "").replace(/\/+$/,"") || "/",
          }));

        const folders = items
          .filter((x) => (x.type ?? x.kind) === "folder")
          .map((x) => ({
            type: "folder" as const,
            name: String(x.name ?? x.title ?? ""),
            path: (String(x.path ?? x.url ?? `/${x.name ?? x.title ?? ""}`) || "/").replace(/\/+$/,"") || "/",
          }));

        // добавляем в папки дочерние страницы по префиксу пути
        const tree: Node[] = folders.map(f => {
          const prefix = f.path === "/" ? "/" : f.path + "/";
          const children = pages.filter(p => p.path.startsWith(prefix) && p.path !== f.path);
          return { ...f, children };
        });

        setNodes([...tree, ...pages.filter(p => !folders.some(f => p.path.startsWith(f.path + "/")))]);

        const data = await fetch(`/api/admin/access?role=${encodeURIComponent(roleKey)}`).then(r => r.json());
        setRules((data?.rules ?? []) as Rule[]);
      } catch {
        setDbDown(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, roleKey]);

  const togglePage = (path: string) => {
    setRules(prev => {
      const idx = prev.findIndex(r => r.path === path);
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], allowed: !copy[idx].allowed };
        return copy;
      }
      return [...prev, { path, allowed: true }];
    });
  };

  const setFolderAllowed = (folder: Node, value: boolean) => {
    const pages = flattenPages([folder]);
    setRules(prev => {
      const map = new Map(prev.map(r => [r.path, r.allowed]));
      for (const p of pages) map.set(p, value);
      return Array.from(map.entries()).map(([path, allowed]) => ({ path, allowed }));
    });
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleKey, rules }),
      });
      if (!res.ok) throw new Error("save failed");
      onClose();
    } catch {
      setDbDown(true);
    } finally {
      setLoading(false);
    }
  };

  const FolderRow = ({ folder }: { folder: Node }) => {
    const state = folderState(folder, allowedSet);
    const selected = state === "all";
    const indeterminate = state === "some";
    return (
      <div className="flex items-center justify-between rounded-md border p-2 bg-content1">
        <div className="text-sm font-medium">{folder.path}</div>
        <Checkbox
          isSelected={selected}
          isIndeterminate={indeterminate}
          onValueChange={(v: boolean) => setFolderAllowed(folder, v)}
        >
          Разрешить папку
        </Checkbox>
      </div>
    );
  };

  const renderNodes = (items: Node[]) =>
    items.map((n) => {
      if (n.type === "folder") {
        return (
          <div key={`f:${n.path}`} className="space-y-2">
            <FolderRow folder={n} />
            <div className="ml-4 space-y-2">{n.children?.map((c) =>
              <div key={c.path} className="flex items-center justify-between rounded-md border p-2">
                <div className="text-sm">{c.path}</div>
                <Checkbox
                  isSelected={allowedSet.has(c.path)}
                  onValueChange={() => togglePage(c.path)}
                >
                  Разрешить
                </Checkbox>
              </div>
            )}</div>
          </div>
        );
      }
      return (
        <div key={`p:${n.path}`} className="flex items-center justify-between rounded-md border p-2">
          <div className="text-sm">{n.path}</div>
          <Checkbox
            isSelected={allowedSet.has(n.path)}
            onValueChange={() => togglePage(n.path)}
          >
            Разрешить
          </Checkbox>
        </div>
      );
    });

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => (!open ? onClose() : null)} size="lg" backdrop="blur">
      <ModalContent>
        <ModalHeader>Доступы для роли: {roleKey}</ModalHeader>
        <ModalBody>
          {dbDown ? (
            <div className="text-danger">БД недоступна. Выполните миграции и повторите.</div>
          ) : loading ? (
            <div className="py-6 text-foreground-500">Загрузка…</div>
          ) : (
            <div className="max-h-[60vh] overflow-auto space-y-2">
              {nodes.length ? renderNodes(nodes) : <div className="text-sm text-foreground-500">Нет страниц</div>}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={loading}>Отмена</Button>
          <Button color="primary" onPress={save} isLoading={loading} isDisabled={dbDown}>Сохранить</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
