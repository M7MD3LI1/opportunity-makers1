import prisma from "../config/db";

async function main() {
  const userId = 17;
  await prisma.evaluation.upsert({
    where: { userId_month: { userId, month: "2026-05" } },
    update: {
      task1Score: 4, task1Hours: 10,
      task2Score: 3, task2Hours: 5,
      meetingScore: 4, meetingHours: 2,
      vpiT: 3.8,
      vpiM: 4.0,
      kpi: 3.9,
      achievementRate: 97.5,
      rating: "Outstanding performance! Highly committed and productive.",
    },
    create: {
      userId,
      month: "2026-05",
      task1Score: 4, task1Hours: 10,
      task2Score: 3, task2Hours: 5,
      meetingScore: 4, meetingHours: 2,
      vpiT: 3.8,
      vpiM: 4.0,
      kpi: 3.9,
      achievementRate: 97.5,
      rating: "Outstanding performance! Highly committed and productive.",
    }
  });
  console.log("✅ Seeded evaluation for User 17 (Aya).");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
