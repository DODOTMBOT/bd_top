export type Plan = {
  id: 'basic' | 'pro' | 'scale';
  name: string;
  tagline: string;
  monthlyPrice: number;   // в рублях
  yearlyPrice: number;    // в рублях (со скидкой)
  popular?: boolean;      // пометка «Популярный»
  badge?: string;         // «-20% при оплате за год» и т.п.
  features: string[];     // список ключевых фич
  limits?: { label: string; value: string }[]; // лимиты по точкам/сотрудникам
  includedModules: string[]; // HACCP, Маркировка, Файлы, Обучение, KPI...
};

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Старт для одной точки',
    monthlyPrice: 2990,
    yearlyPrice: 2990 * 10, // условно -20% (10 месяцев)
    features: [
      'Журналы HACCP (базовые формы)',
      'Маркировка и этикетки',
      'Файловое хранилище (до 1 ГБ)',
      'Базовые чек-листы смен',
    ],
    limits: [
      { label: 'Точки', value: '1' },
      { label: 'Сотрудники', value: 'до 15' },
    ],
    includedModules: ['HACCP', 'Маркировка', 'Файлы', 'Чек-листы'],
    badge: 'Экономия при годовой оплате',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Сеть из нескольких точек',
    monthlyPrice: 5990,
    yearlyPrice: 5990 * 10,
    popular: true,
    features: [
      'Все из Basic',
      'Обучение и тестирование персонала',
      'KPI и мотивация',
      'Расширенные отчёты и аудит',
      'Приоритетная поддержка',
    ],
    limits: [
      { label: 'Точки', value: 'до 5' },
      { label: 'Сотрудники', value: 'до 100' },
    ],
    includedModules: ['HACCP', 'Маркировка', 'Файлы', 'Чек-листы', 'Обучение', 'KPI'],
    badge: 'Популярный',
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Для быстрорастущих сетей',
    monthlyPrice: 12990,
    yearlyPrice: 12990 * 10,
    features: [
      'Все из Pro',
      'Гибкие роли и ACL',
      'Импорт/экспорт (CSV/XLSX)',
      'Интеграции API (iiko, Poster, Telegram)',
      'SLA 99.9%',
    ],
    limits: [
      { label: 'Точки', value: '10+' },
      { label: 'Сотрудники', value: '200+' },
    ],
    includedModules: ['HACCP', 'Маркировка', 'Файлы', 'Чек-листы', 'Обучение', 'KPI', 'Интеграции'],
    badge: 'Для сетей',
  },
];

export const ALL_MODULES = [
  'HACCP',
  'Маркировка', 
  'Файлы',
  'Чек-листы',
  'Обучение',
  'KPI',
  'Интеграции'
];
