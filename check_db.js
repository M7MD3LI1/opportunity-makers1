const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany();
  console.log(JSON.stringify(tasks, null, 2));
  const departments = await prisma.department.findMany();
  console.log(JSON.stringify(departments, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
