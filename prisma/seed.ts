const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const items = [
    { label: "Profile", path: "/profile", order: 0 },
    { label: "Admin", path: "/admin", order: 1 },
    { label: "Marketpleys", path: "/marketpleys", order: 2 },
    { label: "Pricing", path: "/pricing", order: 3 },
  ];
  
  for (const item of items) {
    await prisma.menu.create({
      data: item,
    });
  }
}

main().finally(() => prisma.$disconnect());