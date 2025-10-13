"use client";

import { useState, useTransition } from "react";
import { Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { toggleActive, deletePlan } from "./_actions";
import PlanForm from "./PlanForm";

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

interface SubscriptionsTabProps {
  plans: Plan[];
}

export default function SubscriptionsTab({ plans }: SubscriptionsTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
  const [pending, startTransition] = useTransition();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const formatPrice = (cents: number | null | undefined) => {
    const value = cents ?? 0;
    return new Intl.NumberFormat('ru-RU').format(value / 100) + ' ₽';
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    startTransition(async () => {
      await toggleActive(id, !isActive);
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот план?')) {
      startTransition(async () => {
        await deletePlan(id);
      });
    }
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedPlan(undefined);
    onOpen();
  };

  const handleClose = () => {
    setSelectedPlan(undefined);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Подписки (тарифы)</h2>
        <div className="flex gap-2">
          <Button
            color="primary"
            onPress={handleCreate}
          >
            Создать план
          </Button>
          <Button
            variant="flat"
            isDisabled
          >
            Импорт/Экспорт
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        {!plans || plans.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-sm text-muted-foreground">
              Нет тарифов в выборке. Нажмите «Создать план». (Проверь /api/debug/subscriptions)
            </div>
          </div>
        ) : (
          <Table aria-label="Таблица планов подписки">
            <TableHeader>
              <TableColumn>НАЗВАНИЕ</TableColumn>
              <TableColumn>SLUG</TableColumn>
              <TableColumn>ЦЕНА</TableColumn>
              <TableColumn>ПОПУЛЯРНЫЙ</TableColumn>
              <TableColumn>АКТИВЕН</TableColumn>
              <TableColumn>ДАТА</TableColumn>
              <TableColumn>ДЕЙСТВИЯ</TableColumn>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      {plan.tagline && (
                        <div className="text-sm text-gray-500">{plan.tagline}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {plan.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{formatPrice(plan.priceMonthlyCents)}/мес</div>
                      {plan.priceYearlyCents && (
                        <div className="text-sm text-gray-500">
                          {formatPrice(plan.priceYearlyCents)}/год
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan.popular && (
                      <Chip color="primary" size="sm">
                        {plan.badge || 'Популярный'}
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={plan.isActive ? "success" : "default"}
                      size="sm"
                    >
                      {plan.isActive ? "Активен" : "Неактивен"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(plan.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => handleEdit(plan)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        size="sm"
                        color={plan.isActive ? "warning" : "success"}
                        variant="flat"
                        onPress={() => handleToggleActive(plan.id, plan.isActive)}
                        isLoading={pending}
                      >
                        {plan.isActive ? "Деактивировать" : "Активировать"}
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleDelete(plan.id)}
                        isLoading={pending}
                      >
                        Удалить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            {selectedPlan ? 'Редактировать план' : 'Создать план'}
          </ModalHeader>
          <ModalBody>
            <PlanForm
              plan={selectedPlan ? {
                ...selectedPlan,
                includedModules: selectedPlan.includedModules ? JSON.parse(selectedPlan.includedModules) : [],
                limits: selectedPlan.limits ? JSON.parse(selectedPlan.limits) : [],
              } : undefined}
              onClose={handleClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}