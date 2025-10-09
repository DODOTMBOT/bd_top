export default function AdminGuidePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium mb-2">Руководство по системе RBAC</h2>
        <p className="text-sm text-gray-600">
          Подробное руководство по настройке и использованию системы управления доступом
        </p>
      </div>

      <div className="grid gap-6">
        {/* Что такое RBAC */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">🔐 Что такое RBAC?</h3>
          <p className="text-sm text-blue-700 mb-3">
            RBAC (Role-Based Access Control) - это система управления доступом, основанная на ролях.
          </p>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Основные понятия:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Роль</strong> - набор прав (например: "Администратор", "Менеджер")</li>
              <li><strong>Ресурс</strong> - то, к чему нужен доступ (страницы, API, функции)</li>
              <li><strong>Разрешение</strong> - связь между ролью и ресурсом (разрешить/запретить)</li>
              <li><strong>Пользователь</strong> - получает роли и через них доступ к ресурсам</li>
            </ul>
          </div>
        </div>

        {/* Как работает система */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-green-800">⚙️ Как работает система</h3>
          <div className="text-sm text-green-700 space-y-3">
            <div>
              <p className="font-medium mb-2">1. Пользователь заходит на защищённую страницу</p>
              <p>Система проверяет, есть ли у пользователя роль с доступом к этой странице</p>
            </div>
            <div>
              <p className="font-medium mb-2">2. Проверка разрешений</p>
              <p>Если есть разрешение "Разрешить" - доступ открыт, если "Запретить" - заблокирован</p>
            </div>
            <div>
              <p className="font-medium mb-2">3. Роль "Владелец" (owner)</p>
              <p>Всегда имеет доступ ко всему в системе, независимо от настроек</p>
            </div>
          </div>
        </div>

        {/* Пошаговая настройка */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-yellow-800">📋 Пошаговая настройка</h3>
          <div className="text-sm text-yellow-700 space-y-4">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Шаг 1: Создание ролей</h4>
              <p>Перейдите в раздел "Роли" и создайте роли для ваших пользователей:</p>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><code>manager</code> - менеджеры</li>
                <li><code>employee</code> - сотрудники</li>
                <li><code>viewer</code> - только просмотр</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Шаг 2: Создание ресурсов</h4>
              <p>В разделе "Ресурсы" добавьте пути, которые нужно защитить:</p>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><code>/admin/*</code> - все админские страницы</li>
                <li><code>/api/private/*</code> - приватные API</li>
                <li><code>/partner/points</code> - управление точками</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Шаг 3: Настройка разрешений</h4>
              <p>В разделе "Разрешения" создайте матрицу доступов:</p>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Менеджерам - доступ к админке</li>
                <li>Сотрудникам - доступ к точкам</li>
                <li>Просмотрщикам - только чтение</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Примеры паттернов */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">🎯 Примеры паттернов ресурсов</h3>
          <div className="text-sm text-purple-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Страницы:</h4>
                <ul className="space-y-1">
                  <li><code>/admin/*</code> - все админские</li>
                  <li><code>/partner/*</code> - партнёрские</li>
                  <li><code>/api/private/*</code> - приватные API</li>
                  <li><code>/reports/*</code> - отчёты</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Конкретные пути:</h4>
                <ul className="space-y-1">
                  <li><code>/admin/users</code> - управление пользователями</li>
                  <li><code>/partner/points</code> - точки партнёра</li>
                  <li><code>/api/export</code> - экспорт данных</li>
                  <li><code>*</code> - всё в системе</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Лучшие практики */}
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-red-800">⚠️ Лучшие практики</h3>
          <div className="text-sm text-red-700 space-y-3">
            <div>
              <h4 className="font-medium mb-2">✅ Рекомендации:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Используйте принцип минимальных привилегий</li>
                <li>Группируйте права по ролям, а не по пользователям</li>
                <li>Тестируйте доступ после изменений</li>
                <li>Ведите логи изменений разрешений</li>
                <li>Регулярно пересматривайте права доступа</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">❌ Избегайте:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Слишком широких разрешений (* для всех)</li>
                <li>Дублирования ролей с одинаковыми правами</li>
                <li>Удаления ролей без проверки пользователей</li>
                <li>Игнорирования принципа "запрещено по умолчанию"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">🔧 Решение проблем</h3>
          <div className="text-sm text-gray-700 space-y-3">
            <div>
              <h4 className="font-medium mb-2">Пользователь не может зайти на страницу:</h4>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Проверьте, назначена ли пользователю роль</li>
                <li>Убедитесь, что роль имеет разрешение на ресурс</li>
                <li>Проверьте, что ресурс активен</li>
                <li>Убедитесь, что нет запрещающего разрешения</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Страница 403 (Доступ запрещён):</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Пользователь не авторизован - перенаправление на логин</li>
                <li>Нет роли с доступом к ресурсу</li>
                <li>Есть явный запрет (deny) для роли</li>
                <li>Ресурс неактивен или удалён</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Контакты */}
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-indigo-800">📞 Поддержка</h3>
          <div className="text-sm text-indigo-700">
            <p>Если у вас возникли вопросы по настройке RBAC:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Проверьте логи сервера на наличие ошибок</li>
              <li>Убедитесь, что пользователь имеет роль "owner" для полного доступа</li>
              <li>Проверьте, что все ресурсы созданы и активны</li>
              <li>Обратитесь к разработчику системы</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
