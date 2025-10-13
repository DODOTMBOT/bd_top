export type PageMeta = {
  path: string;         // '/pricing'
  title: string;        // 'Подписки'
  section?: string;     // 'Маркетинг' | 'Администрирование' | ...
  isPublic?: boolean;   // true для публичных
  source: 'registry';   // источник данных
};

export const PAGES_REGISTRY: PageMeta[] = [
  { 
    path: '/pricing', 
    title: 'Подписки', 
    section: 'Маркетинг', 
    isPublic: true,
    source: 'registry'
  },
  { 
    path: '/profile', 
    title: 'Профиль', 
    section: 'Аккаунт', 
    isPublic: false,
    source: 'registry'
  },
  // При желании можно добавлять сюда и другие существующие страницы
  // { path: '/about', title: 'О нас', section: 'Маркетинг', isPublic: true, source: 'registry' },
  // { path: '/contact', title: 'Контакты', section: 'Маркетинг', isPublic: true, source: 'registry' },
];
