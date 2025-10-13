"use client";

const faqData = [
  {
    q: "Можно ли сменить план?",
    a: "Да, вы можете изменить план в любое время. При переходе на более дорогой план доплата будет рассчитана пропорционально оставшемуся периоду. При переходе на более дешёвый план разница будет зачислена на ваш счёт."
  },
  {
    q: "Есть ли лимиты по сотрудникам?",
    a: "Да, каждый план имеет ограничения по количеству сотрудников. Basic: до 15 сотрудников, Pro: до 100 сотрудников, Scale: 200+ сотрудников. При превышении лимита вы можете перейти на следующий план или приобрести дополнительные лицензии."
  },
  {
    q: "Как работает оплата за год?",
    a: "При оплате за год вы получаете скидку до 20% по сравнению с помесячной оплатой. Оплата списывается единовременно за весь год, и вы получаете доступ ко всем функциям плана на 12 месяцев."
  },
  {
    q: "Поддержка и SLA",
    a: "Все планы включают техническую поддержку. Basic: поддержка по email в течение 24 часов, Pro: приоритетная поддержка в течение 12 часов, Scale: SLA 99.9% с поддержкой в течение 4 часов и телефонной линией."
  },
  {
    q: "Можно ли экспортировать данные?",
    a: "Да, все планы позволяют экспортировать ваши данные. В планах Basic и Pro доступен экспорт в PDF и Excel. В плане Scale дополнительно доступны API для интеграций и экспорт в различных форматах."
  },
  {
    q: "Есть ли пробный период?",
    a: "Мы предоставляем 14-дневный бесплатный пробный период для всех планов. В течение пробного периода у вас будет доступ ко всем функциям выбранного плана без ограничений."
  }
];

export default function FAQ() {
  return (
    <section className="rounded-2xl border bg-white shadow-sm p-6 space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">Часто задаваемые вопросы</h2>
      <p className="text-sm text-muted-foreground mb-2">Ответы на популярные вопросы о тарифах и услугах</p>

      <div className="divide-y rounded-xl border overflow-hidden">
        {faqData.map((it, i) => (
          <details key={i} className="group [&_summary]:list-none">
            <summary className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 whitespace-normal">
              <span className="inline-flex items-center justify-between w-full">
                <span className="text-sm font-medium">{it.q}</span>
                <span className="ml-3 shrink-0 transition group-open:rotate-180">⌄</span>
              </span>
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground whitespace-normal">
              {it.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
