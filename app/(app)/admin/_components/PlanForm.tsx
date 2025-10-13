"use client";

import { useState, useTransition } from "react";
import { Button, Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import { createPlan, updatePlan } from "./_actions";

type Plan = {
  id?: string;
  slug: string;
  name: string;
  tagline?: string | null;
  priceMonthlyCents: number;
  priceYearlyCents?: number | null;
  defaultPeriod: 'month' | 'year';
  popular: boolean;
  badge?: string | null;
  includedModules: string[];
  limits: { label: string; value: string }[];
  sortOrder: number;
  isActive: boolean;
};

interface PlanFormProps {
  plan?: Plan;
  onClose: () => void;
}

export default function PlanForm({ plan, onClose }: PlanFormProps) {
  const [form, setForm] = useState({
    slug: plan?.slug || '',
    name: plan?.name || '',
    tagline: plan?.tagline || '',
    priceMonthlyCents: plan?.priceMonthlyCents || 0,
    priceYearlyCents: plan?.priceYearlyCents || null,
    defaultPeriod: plan?.defaultPeriod || 'month' as 'month' | 'year',
    popular: plan?.popular || false,
    badge: plan?.badge || '',
    includedModules: plan?.includedModules || [],
    limits: plan?.limits || [],
    sortOrder: plan?.sortOrder || 100,
    isActive: plan?.isActive ?? true,
  });

  const [error, setError] = useState<string>('');
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    startTransition(async () => {
      const result = plan?.id 
        ? await updatePlan({ ...form, id: plan.id })
        : await createPlan(form);
      
      if (result.ok) {
        onClose();
      } else {
        setError(result.error || 'Ошибка');
      }
    });
  };

  const addModule = () => {
    setForm(prev => ({
      ...prev,
      includedModules: [...prev.includedModules, '']
    }));
  };

  const updateModule = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      includedModules: prev.includedModules.map((m, i) => i === index ? value : m)
    }));
  };

  const removeModule = (index: number) => {
    setForm(prev => ({
      ...prev,
      includedModules: prev.includedModules.filter((_, i) => i !== index)
    }));
  };

  const addLimit = () => {
    setForm(prev => ({
      ...prev,
      limits: [...prev.limits, { label: '', value: '' }]
    }));
  };

  const updateLimit = (index: number, field: 'label' | 'value', value: string) => {
    setForm(prev => ({
      ...prev,
      limits: prev.limits.map((l, i) => 
        i === index ? { ...l, [field]: value } : l
      )
    }));
  };

  const removeLimit = (index: number) => {
    setForm(prev => ({
      ...prev,
      limits: prev.limits.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-semibold">
        {plan?.id ? 'Редактировать план' : 'Создать план'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Slug"
            placeholder="basic"
            value={form.slug}
            onValueChange={(value) => setForm(prev => ({ ...prev, slug: value }))}
            isRequired
            description="Уникальный идентификатор (только латиница, цифры, дефисы)"
          />
          <Input
            label="Название"
            placeholder="Basic"
            value={form.name}
            onValueChange={(value) => setForm(prev => ({ ...prev, name: value }))}
            isRequired
          />
        </div>

        <Textarea
          label="Описание"
          placeholder="Старт для одной точки"
          value={form.tagline}
          onValueChange={(value) => setForm(prev => ({ ...prev, tagline: value }))}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Цена за месяц (копейки)"
            placeholder="299000"
            type="number"
            value={form.priceMonthlyCents.toString()}
            onValueChange={(value) => setForm(prev => ({ ...prev, priceMonthlyCents: parseInt(value) || 0 }))}
            isRequired
            description="299000 = 2 990 ₽"
          />
          <Input
            label="Цена за год (копейки)"
            placeholder="2990000"
            type="number"
            value={form.priceYearlyCents?.toString() || ''}
            onValueChange={(value) => setForm(prev => ({ ...prev, priceYearlyCents: parseInt(value) || null }))}
            description="2990000 = 29 900 ₽"
          />
          <Select
            label="Период по умолчанию"
            selectedKeys={[form.defaultPeriod]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as 'month' | 'year';
              setForm(prev => ({ ...prev, defaultPeriod: value }));
            }}
          >
            <SelectItem key="month" value="month">Месяц</SelectItem>
            <SelectItem key="year" value="year">Год</SelectItem>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Бейдж"
            placeholder="Популярный"
            value={form.badge}
            onValueChange={(value) => setForm(prev => ({ ...prev, badge: value }))}
          />
          <Input
            label="Порядок сортировки"
            type="number"
            value={form.sortOrder.toString()}
            onValueChange={(value) => setForm(prev => ({ ...prev, sortOrder: parseInt(value) || 100 }))}
          />
          <div className="flex items-center gap-2">
            <Switch
              isSelected={form.popular}
              onValueChange={(value) => setForm(prev => ({ ...prev, popular: value }))}
            />
            <span className="text-sm">Популярный</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            isSelected={form.isActive}
            onValueChange={(value) => setForm(prev => ({ ...prev, isActive: value }))}
          />
          <span className="text-sm">Активен</span>
        </div>

        {/* Модули */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Включенные модули</h3>
            <Button size="sm" onPress={addModule}>Добавить</Button>
          </div>
          <div className="space-y-2">
            {form.includedModules.map((module, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="HACCP"
                  value={module}
                  onValueChange={(value) => updateModule(index, value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => removeModule(index)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Лимиты */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Лимиты</h3>
            <Button size="sm" onPress={addLimit}>Добавить</Button>
          </div>
          <div className="space-y-2">
            {form.limits.map((limit, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Точки"
                  value={limit.label}
                  onValueChange={(value) => updateLimit(index, 'label', value)}
                  className="flex-1"
                />
                <Input
                  placeholder="1"
                  value={limit.value}
                  onValueChange={(value) => updateLimit(index, 'value', value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => removeLimit(index)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="flat" onPress={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={pending}
            isDisabled={pending}
          >
            {plan?.id ? 'Обновить' : 'Создать'}
          </Button>
        </div>
      </form>
    </div>
  );
}
