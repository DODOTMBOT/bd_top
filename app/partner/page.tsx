import { guard } from '@/lib/guard';
import Link from 'next/link';

export default async function PartnerPage() {
  const { role } = await guard('/partner');
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Партнёр</h1>
      {(role === 'PARTNER' || role === 'OWNER') && (
        <div className="mt-4">
          <Link
            href="/partner/points"
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Точки
          </Link>
        </div>
      )}
      <p className="opacity-70">Здесь будут точки и сотрудники.</p>
    </section>
  );
}


