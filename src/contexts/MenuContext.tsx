"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type MenuItem = {
  id?: string;
  label: string;
  path: string;
  parentId: string | null;
  order: number;
  visible: boolean;
};

type Ctx = {
  items: MenuItem[];
  setItems: (upd: (prev: MenuItem[]) => MenuItem[]) => void;
  save: () => Promise<boolean>;
  reload: () => Promise<void>;
  busy: boolean;
};

const C = createContext<Ctx | null>(null);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [items, setItemsState] = useState<MenuItem[]>([]);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/menu", { cache: "no-store" });
      if (!res.ok) throw new Error("fail");
      const json = await res.json();
      setItemsState(json.items ?? []);
    } catch {
      setItemsState([]);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const setItems = useCallback((upd: (prev: MenuItem[]) => MenuItem[]) => {
    setItemsState((p) => upd(p));
  }, []);

  const save = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) return false;
      await reload();
      try { new BroadcastChannel("menu-updates").postMessage({ type: "reload" }); } catch {}
      return true;
    } finally {
      setBusy(false);
    }
  }, [items, reload]);

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("menu-updates");
      bc.onmessage = (e) => { if (e?.data?.type === "reload") void reload(); };
    } catch {}
    return () => { try { bc?.close(); } catch {} };
  }, [reload]);

  const v = useMemo<Ctx>(() => ({ items, setItems, save, reload, busy }), [items, setItems, save, reload, busy]);
  return <C.Provider value={v}>{children}</C.Provider>;
}

export function useMenu() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}