import prisma from "../config/db";

async function main() {
  const userId = 17;
  const dates = ["2026-05-01", "2026-05-02"];
  
  for (const date of dates) {
    await prisma.attendanceRecord.upsert({
      where: { userId_date: { userId, date } },
      update: { status: date === "2026-05-01" ? "PRESENT" : "ABSENT", excuse: date === "2026-05-02" ? "انا اسف" : undefined },
      create: { userId, date, status: date === "2026-05-01" ? "PRESENT" : "ABSENT", excuse: date === "2026-05-02" ? "انا اسف" : undefined }
    });
  }
  console.log("✅ Seeded attendance for User 17.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
