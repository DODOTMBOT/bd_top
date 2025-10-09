import { guard } from '@/lib/guard';

export default async function PointPage() {
  await guard('/point');
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Точка</h1>
      <p className="opacity-70">Здесь будет управление точкой.</p>
    </section>
  );
}


