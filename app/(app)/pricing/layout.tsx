import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Подписки',
  description: 'Выберите подходящий тарифный план для вашего HoReCa бизнеса. Гибкие планы с бесплатным пробным периодом.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
