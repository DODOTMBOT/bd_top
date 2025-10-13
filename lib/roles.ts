export type Role = 'OWNER' | 'PARTNER' | 'POINT' | 'USER'

// Отображение для UI (ru). При необходимости добавим i18n.
export const ROLE_LABEL_RU: Record<Role, string> = {
  OWNER: 'Оунер',
  PARTNER: 'Партнёр',
  POINT: 'Торговая точка',
  USER: 'Сотрудник',
}

// Универсальный хелпер
export function roleLabel(role: Role, locale: 'ru' | 'en' = 'ru'): string {
  if (locale === 'ru') return ROLE_LABEL_RU[role]
  return role // по умолчанию отдаем сырой код
}

// Порядок ролей для Select компонентов
export const ROLES_ORDER: Role[] = ['OWNER','PARTNER','POINT','USER']
