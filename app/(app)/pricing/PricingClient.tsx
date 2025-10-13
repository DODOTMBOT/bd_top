"use client";

import { useState, useEffect } from "react";
import PeriodToggle from "./PeriodToggle";
import PlanCard from "./PlanCard";
import CompareTable from "./CompareTable";
import FAQ from "./FAQ";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  badge?: string;
  features: string[];
  limits?: { label: string; value: string }[];
  includedModules: string[];
};

interface PricingClientProps {
  plans: Plan[];
}

export default function PricingClient({ plans }: PricingClientProps) {
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  // Синхронизация с URL параметрами
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const periodParam = urlParams.get('period');
    if (periodParam === 'year' || periodParam === 'month') {
      setPeriod(periodParam);
    }
  }, []);

  const handlePeriodChange = (newPeriod: 'month' | 'year') => {
    setPeriod(newPeriod);
    
    // Обновляем URL без перезагрузки страницы
    const url = new URL(window.location.href);
    url.searchParams.set('period', newPeriod);
    window.history.replaceState({}, '', url.toString());
  };

  const scrollToCompare = () => {
    const compareSection = document.getElementById('compare-section');
    if (compareSection) {
      compareSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-full p-6 lg:p-8 bg-transparent">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Выберите подходящий план</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">Получите полный контроль над вашим HoReCa бизнесом с гибкими тарифными планами.</p>
          <div className="pt-2">
            <PeriodToggle period={period} onPeriodChange={handlePeriodChange} />
          </div>
          <p className="text-sm text-muted-foreground">
            Все цены указаны с НДС, если применимо
          </p>
        </section>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch mt-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              period={period}
              onCompareClick={scrollToCompare}
            />
          ))}
        </div>

        {/* Compare Table */}
        <div id="compare-section">
          <CompareTable plans={plans} period={period} onPeriodChange={handlePeriodChange} />
        </div>

        {/* FAQ */}
        <div>
          <FAQ />
        </div>

        {/* CTA Section */}
        <section className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              Готовы начать?
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Присоединяйтесь к тысячам ресторанов, которые уже используют 
              HoReCa Control для управления своим бизнесом.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/auth/register"
                className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                aria-label="Начать бесплатный пробный период"
              >
                Начать бесплатно
              </a>
              <a
                href="/signin"
                className="inline-flex items-center rounded-xl border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                aria-label="Войти в существующий аккаунт"
              >
                Войти
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
