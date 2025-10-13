const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[DB] OK');
    process.exit(0);
  } catch (error) {
    console.error('[DB] FAIL');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();

