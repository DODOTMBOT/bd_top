import { guard } from '@/lib/guard';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmployeePage() {
  await guard('/employee');
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Сотрудник</h1>
      <p className="opacity-70">Здесь будут задачи сотрудника.</p>
    </section>
  );
}


