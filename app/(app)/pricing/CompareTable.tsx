"use client";

import { Badge } from "@heroui/react";
import { ALL_MODULES } from "./plans";
import PeriodToggle from "./PeriodToggle";

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

interface CompareTableProps {
  plans: Plan[];
  period: 'month' | 'year';
  onPeriodChange: (period: 'month' | 'year') => void;
}

export default function CompareTable({ plans, period, onPeriodChange }: CompareTableProps) {
  const getModuleStatus = (plan: Plan, module: string) => {
    return plan.includedModules.includes(module);
  };

  return (
    <section className="rounded-2xl border bg-white shadow-sm p-6">
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          Сравнение планов
        </h2>
        <PeriodToggle period={period} onPeriodChange={onPeriodChange} />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Модули
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-900">
                              {plan.name}
                            </span>
                            {plan.popular && (
                              <Badge color="primary" size="sm">
                                Популярный
                              </Badge>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-primary-600">
                            {(period === 'month' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString('ru-RU')}₽
                          </div>
                          <div className="text-sm text-gray-500">
                            {period === 'month' ? 'в месяц' : 'в год'}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_MODULES.map((module, index) => (
                    <tr key={module} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {module}
                      </td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          {getModuleStatus(plan, module) ? (
                            <svg 
                              className="w-6 h-6 text-green-500 mx-auto" 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                              aria-label="Включено"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          ) : (
                            <span className="text-gray-400 text-xl" aria-label="Не включено">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-2xl border bg-white shadow-sm p-6 ${plan.popular ? 'ring-1 ring-primary/30' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.tagline}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {(period === 'month' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString('ru-RU')}₽
                </div>
                <div className="text-sm text-gray-500">
                  {period === 'month' ? 'в месяц' : 'в год'}
                </div>
              </div>
            </div>
            
            {plan.popular && (
              <Badge color="primary" className="mb-4">
                Популярный
              </Badge>
            )}

            <div className="space-y-3">
              {ALL_MODULES.map((module) => (
                <div key={module} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{module}</span>
                  {getModuleStatus(plan, module) ? (
                    <svg 
                      className="w-5 h-5 text-green-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-label="Включено"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  ) : (
                    <span className="text-gray-400" aria-label="Не включено">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
