import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: "owner@example.com", roleKey: "owner", pointName: null, active: true },
    { email: "partner@example.com", roleKey: "partner", pointName: "Cafe Aurora", active: true },
    { email: "manager@example.com", roleKey: "manager", pointName: "Bar Nebula", active: true },
    { email: "staff@example.com", roleKey: "employee", pointName: "Cafe Aurora", active: false },
  ];

  for (const u of users) {
    await prisma.adminUser.upsert({
      where: { email: u.email },
      create: u,
      update: u,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
