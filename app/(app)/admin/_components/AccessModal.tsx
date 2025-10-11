"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox } from "@heroui/react";

type Rule = { path: string; allowed: boolean };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  roleKey: string; // "owner" | "partner" | "manager" | "employee"
};

export default function AccessModal({ isOpen, onClose, roleKey }: Props): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [dbDown, setDbDown] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setDbDown(false);
    fetch(`/api/admin/access?role=${encodeURIComponent(roleKey)}`)
      .then(res => {
        if (res.status === 503) {
          setDbDown(true);
          return;
        }
        return res.json();
      })
      .then((data: { role: string; rules: Rule[] } | undefined) => {
        if (data) {
          setRules(data.rules);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, roleKey]);

  const checkedSet = useMemo(() => new Set(rules.filter(r => r.allowed).map(r => r.path)), [rules]);

  const togglePath = (path: string) => {
    setRules(prev =>
      prev.map(r => (r.path === path ? { ...r, allowed: !r.allowed } : r)),
    );
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleKey, rules }),
      });
      
      if (res.status === 503) {
        setDbDown(true);
        return;
      }
      
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => (!open ? onClose() : null)} size="lg" backdrop="blur">
      <ModalContent>
        <ModalHeader>Доступы для роли: {roleKey}</ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="py-6 text-foreground-500">Загрузка…</div>
          ) : dbDown ? (
            <div className="text-danger">БД недоступна. Выполните миграцию и повторите.</div>
          ) : (
            <div className="max-h-[60vh] overflow-auto space-y-2">
              {rules.map(r => (
                <div key={r.path} className="flex items-center justify-between rounded-md border p-2">
                  <div className="text-sm">{r.path}</div>
                  <Checkbox
                    isSelected={checkedSet.has(r.path)}
                    onValueChange={() => togglePath(r.path)}
                  >
                    Разрешить
                  </Checkbox>
                </div>
              ))}
              {rules.length === 0 ? <div className="text-sm text-foreground-500">Нет страниц</div> : null}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={loading}>Отмена</Button>
          <Button 
            color="primary" 
            onPress={save} 
            isLoading={loading} 
            isDisabled={loading || dbDown}
          >
            Сохранить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
