import prisma from "../config/db";

async function main() {
  const aya = await prisma.user.findFirst({
    where: { name: { contains: "Aya" } }
  });

  if (aya) {
    console.log(`Found user: ${aya.name} (ID: ${aya.id})`);
    await prisma.evaluation.upsert({
      where: { userId_month: { userId: aya.id, month: "2026-05" } },
      update: {},
      create: {
        userId: aya.id,
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
    console.log("✅ Seeded evaluation for Aya.");
  } else {
    console.log("❌ Aya not found.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
