import { guard } from '@/lib/guard';

export default async function EmployeePage() {
  await guard('/employee');
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Сотрудник</h1>
      <p className="opacity-70">Здесь будут задачи сотрудника.</p>
    </section>
  );
}


