import prisma from "../config/db";

async function main() {
  console.log("🌱 Seeding evaluations for dummy users...");

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    take: 10,
  });

  for (const user of users) {
    await prisma.evaluation.upsert({
      where: { userId_month: { userId: user.id, month: "2026-05" } },
      update: {},
      create: {
        userId: user.id,
        month: "2026-05",
        task1Score: 4, task1Hours: 10,
        task2Score: 3, task2Hours: 5,
        meetingScore: 4, meetingHours: 2,
        vpiT: 3.5,
        vpiM: 4.0,
        kpi: 3.75,
        achievementRate: 93.75,
        rating: "Excellent performance this month. Very active in meetings.",
      }
    });
  }

  console.log("✅ Evaluations seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
