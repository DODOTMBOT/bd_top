import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-3xl font-semibold mb-6">HoReCa SaaS</h1>
      <p className="text-gray-600 mb-8">Выберите действие</p>
      <Button as={Link} href="/roles" color="primary" size="lg">
        Проверка ролей
      </Button>
    </div>
  );
}
