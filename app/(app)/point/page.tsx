import { checkAccess } from '@/lib/checkAccess';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PointPage() {
  await checkAccess('/point');
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Точка</h1>
      <p className="opacity-70">Здесь будет управление точкой.</p>
    </section>
  );
}


