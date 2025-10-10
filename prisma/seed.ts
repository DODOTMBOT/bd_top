const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const BASE_ROLES = [
  { key: "OWNER",   name: "Владелец",  description: "Full access" },
  { key: "PARTNER", name: "Партнёр",   description: "Управление точками и персоналом" },
  { key: "POINT",   name: "Точка",     description: "Работа точки и операции" },
  { key: "EMPLOYEE",name: "Сотрудник", description: "Доступ сотрудника" },
];

async function main() {
  for (const r of BASE_ROLES) {
    await db.role.upsert({
      where: { key: r.key },
      update: { name: r.name, description: r.description },
      create: r,
    });
  }
}

main().finally(() => db.$disconnect());