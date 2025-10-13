"use client";

import { Plan } from "./plans";
import Link from "next/link";

interface PlanCardProps {
  plan: Plan;
  period: 'month' | 'year';
  onCompareClick: () => void;
}

export default function PlanCard({ plan, period, onCompareClick }: PlanCardProps) {
  const price = period === 'month' ? plan.monthlyPrice : plan.yearlyPrice;
  const savings = period === 'year' ? Math.round((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12) * 100) : 0;

  // Проверяем существование роута /auth/register, если нет - используем /signin
  const ctaHref = "/auth/register"; // В реальном проекте можно проверить существование роута

  return (
    <div 
      className={`flex flex-col justify-between h-full rounded-2xl border bg-white shadow-sm p-6 transition hover:shadow-md ${
        plan.popular 
          ? 'ring-1 ring-primary/30' 
          : ''
      }`}
    >
        {/* Content */}
        <div className="flex flex-col flex-grow space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            {plan.badge && (
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-primary border-primary/30 bg-primary/5">
                {plan.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{plan.tagline}</p>

          {/* Price */}
          <div>
            <div className="text-3xl font-semibold">
              {price.toLocaleString('ru-RU')}<span className="align-top text-sm"> ₽</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {period === 'month' ? 'в месяц' : 'в год'}
            </div>
            {period === 'year' && savings > 0 && (
              <div className="text-xs text-green-600 font-medium mt-1">
                Экономия {savings}%
              </div>
            )}
          </div>

          {/* Limits */}
          {plan.limits && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                {plan.limits.map((limit, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold text-gray-900">{limit.value}</div>
                    <div className="text-sm text-gray-600">{limit.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <ul className="space-y-2 text-sm text-gray-600 list-none mt-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500">✔</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          <Link
            href={ctaHref}
            className="h-11 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition flex items-center justify-center"
            aria-label={`Начать использовать план ${plan.name}`}
          >
            Начать
          </Link>
          <button
            onClick={onCompareClick}
            className="h-11 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
            aria-label="Сравнить планы"
          >
            Сравнить планы
          </button>
        </div>
    </div>
  );
}
