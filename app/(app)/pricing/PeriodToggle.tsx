"use client";

import { Button } from "@heroui/react";

interface PeriodToggleProps {
  period: 'month' | 'year';
  onPeriodChange: (period: 'month' | 'year') => void;
}

export default function PeriodToggle({ period, onPeriodChange }: PeriodToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex bg-gray-100 rounded-lg p-1">
        <Button
          size="sm"
          variant={period === 'month' ? 'solid' : 'light'}
          color={period === 'month' ? 'primary' : 'default'}
          onPress={() => onPeriodChange('month')}
          className="px-4 py-2 text-sm font-medium transition-all"
          aria-label="Переключить на месячную оплату"
        >
          Месяц
        </Button>
        <Button
          size="sm"
          variant={period === 'year' ? 'solid' : 'light'}
          color={period === 'year' ? 'primary' : 'default'}
          onPress={() => onPeriodChange('year')}
          className="px-4 py-2 text-sm font-medium transition-all"
          aria-label="Переключить на годовую оплату"
        >
          Год
        </Button>
      </div>
    </div>
  );
}
