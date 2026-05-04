import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const departments = await prisma.department.findMany();
  console.log(`Found ${departments.length} departments.`);

  const hashedPassword = await bcrypt.hash("User123!", 10);

  const arabicNames = [
    "أحمد محمد علي", "سارة محمود حسن", "محمود إبراهيم سيد", "ليلى يوسف خليل", "عمر خالد وليد",
    "فاطمة الزهراء علي", "ياسين مصطفى كمال", "نور الهدى عادل", "حمزة جلال فوزي", "مريم إيهاب جمال",
    "يوسف شريف منير", "هبة الله سعيد", "عبد الرحمن طارق", "شروق هاني فؤاد", "مصطفى زكريا",
    "آية رفعت صبري", "كريم عاطف شاكر", "دنيا سامي محفوظ", "علاء مجدي رسلان", "جنا تامر حسني",
    "باسم نبيل سليمان", "روان هشام طلعت", "خالد أشرف صبحي", "سلمى إكرامي", "إسلام يسري عمار",
    "دعاء منتصر", "وائل شريف", "إيمان صابر", "رامي عادل", "عبير قاسم"
  ];

  let userCount = 0;

  for (const dept of departments) {
    console.log(`Seeding users for department: ${dept.name}`);
    for (let i = 1; i <= 5; i++) {
      const nameIndex = (userCount) % arabicNames.length;
      const name = arabicNames[nameIndex];
      const email = `user${userCount + 1}@sana3.com`;
      const username = `user_${userCount + 1}`;
      const nationalId = `NAT_${Math.floor(100000000 + Math.random() * 900000000)}`;

      try {
        await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            name,
            email,
            username,
            password: hashedPassword,
            nationalId,
            role: "USER",
            status: "APPROVED",
            departmentId: dept.id,
            governorate: "Cairo",
            gender: i % 2 === 0 ? "female" : "male",
            score: Math.floor(Math.random() * 100),
            points: Math.floor(Math.random() * 500),
            level: "Intermediate",
            currentVpi: 3.0 + Math.random(),
          },
        });
        userCount++;
      } catch (e) {
        console.error(`Error seeding user ${email}:`, e);
      }
    }
  }

  console.log(`Successfully seeded ${userCount} dummy users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
