import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import PricingClient from './PricingClient';

export const dynamic = 'force-dynamic';

async function getPlans() {
  noStore();
  const rows = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return rows;
}

export default async function PricingPage() {
  const rows = await getPlans();
  
  // Преобразуем данные из БД в формат, ожидаемый компонентами
  const plans = rows.length ? rows.map(r => {
    return {
      id: r.slug as 'basic' | 'pro' | 'scale' | string,
      name: r.name,
      tagline: r.description ?? '',
      monthlyPrice: r.priceMonthly,
      yearlyPrice: r.priceYearly,
      popular: r.isPopular,
      badge: undefined,
      features: [],
      limits: [],
      includedModules: [],
    };
  }) : (await import('./plans')).PLANS; // fallback к старым данным

  return <PricingClient plans={plans} />;
}
