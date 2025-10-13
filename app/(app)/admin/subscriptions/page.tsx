import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import SubscriptionsTab from '../_components/SubscriptionsTab';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubscriptionsPage() {
  noStore();
  
  // Загружаем планы подписки
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  console.log('[admin/subscriptions] plans:', plans.length);

  return (
    <div>
      <SubscriptionsTab plans={plans} />
      <div className="mt-2 text-[11px] text-muted-foreground">
        debug: {Array.isArray(plans) ? `plans=${plans.length}` : 'no-data'}
      </div>
    </div>
  );
}
