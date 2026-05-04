import prisma from "./config/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "SanaelForsa2026SecretKey32Chars!";

function encryptNationalId(nationalId: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(nationalId, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

async function seed() {
  console.log("🌱 Seeding database for صناع الفرص...");

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash("Sana3Admin2024!", salt);

  // Fake encrypted national ID for admin
  const adminNid = encryptNationalId("00000000000000");

  const admin = await prisma.user.upsert({
    where: { email: "admin@sana3.com" },
    update: { password: hashedPassword, role: "ADMIN", status: "APPROVED" },
    create: {
      name: "المشرف الرئيسي",
      email: "admin@sana3.com",
      username: "muhammadali",
      password: hashedPassword,
      nationalId: adminNid,
      gender: "male",
      governorate: "القاهرة",
      role: "ADMIN",
      status: "APPROVED",
      mustChangePassword: false,
      score: 100,
      points: 500,
      level: "Leader",
    },
  });

  console.log(`✅ Admin: ${admin.email} | Password: 1102005`);

  // Committees
  const departments = [
    { name: "HR", headName: "أ. محمد إبراهيم", viceName: "أ. سارة أحمد" },
    { name: "PR", headName: "أ. خالد محمود", viceName: "أ. منى حسن" },
    { name: "OR", headName: "د. أميرة يوسف", viceName: "أ. عمر عبدالله" },
    { name: "Training", headName: "أ. ريم السيد", viceName: "أ. أحمد رضا" },
    { name: "Social Media", headName: "أ. نور الهدى", viceName: "أ. حسام طارق" },
  ];

  const depts: any[] = [];
  for (const dept of departments) {
    const d = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    depts.push(d);
  }
  console.log(`✅ ${departments.length} committees created`);

  // Badges
  const badges = [
    { key: "top_performer", name: "Top Performer", nameAr: "الأفضل أداءً", description: "Achieved top score", icon: "🔥", color: "#FF6B35", points: 50 },
    { key: "fast_finisher", name: "Fast Finisher", nameAr: "المنجز السريع", description: "Completed tasks before deadline", icon: "⚡", color: "#FFD700", points: 30 },
    { key: "consistent", name: "Consistent Member", nameAr: "العضو المنتظم", description: "Active for 30 days", icon: "🎯", color: "#4ECDC4", points: 40 },
    { key: "smart_contributor", name: "Smart Contributor", nameAr: "المساهم الذكي", description: "High engagement score", icon: "🧠", color: "#A855F7", points: 35 },
    { key: "first_task", name: "First Task", nameAr: "المهمة الأولى", description: "Submitted first task", icon: "🌟", color: "#3B82F6", points: 10 },
    { key: "team_player", name: "Team Player", nameAr: "لاعب الفريق", description: "Collaborated actively", icon: "🤝", color: "#10B981", points: 25 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {},
      create: badge,
    });
  }
  console.log(`✅ ${badges.length} badges seeded`);

  // Demo KPI snapshots for last 6 weeks
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];
  for (const dept of depts) {
    for (const week of weeks) {
      const existing = await prisma.kpiSnapshot.findFirst({
        where: { departmentId: dept.id, week },
      });
      if (!existing) {
        await prisma.kpiSnapshot.create({
          data: {
            departmentId: dept.id,
            week,
            taskCompletion: Math.round(50 + Math.random() * 50),
            avgTime: Math.round((1 + Math.random() * 3) * 10) / 10,
            attendance: Math.round(60 + Math.random() * 40),
            activityScore: Math.round(40 + Math.random() * 60),
            missedDeadlines: Math.floor(Math.random() * 5),
          },
        });
      }
    }
  }
  console.log(`✅ KPI snapshots seeded`);
  
  // Dummy Users
  console.log("👥 Seeding dummy users...");
  const dummyUsersNames = [
    "أحمد محمد علي", "سارة محمود حسن", "محمود إبراهيم سيد", "ليلى يوسف خليل", "عمر خالد وليد",
    "فاطمة الزهراء علي", "ياسين مصطفى كمال", "نور الهدى عادل", "حمزة جلال فوزي", "مريم إيهاب جمال",
    "يوسف شريف منير", "هبة الله سعيد", "عبد الرحمن طارق", "شروق هاني فؤاد", "مصطفى زكريا",
    "آية رفعت صبري", "كريم عاطف شاكر", "دنيا سامي محفوظ", "علاء مجدي رسلان", "جنا تامر حسني",
    "باسم نبيل سليمان", "روان هشام طلعت", "خالد أشرف صبحي", "سلمى إكرامي", "إسلام يسري عمار"
  ];

  let dummyCount = 0;
  for (const dept of depts) {
    for (let i = 0; i < 5; i++) {
      const name = dummyUsersNames[dummyCount % dummyUsersNames.length];
      const email = `user${dummyCount + 1}@sana3.com`;
      const username = `user_${dummyCount + 1}`;
      const nationalId = encryptNationalId(`2990101${10000 + dummyCount}`);
      
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
          gender: i % 2 === 0 ? "male" : "female",
          governorate: "القاهرة",
          score: Math.floor(Math.random() * 80) + 20,
          points: Math.floor(Math.random() * 300) + 50,
          level: "Beginner",
        }
      });
      dummyCount++;
    }
  }
  console.log(`✅ ${dummyCount} dummy users seeded`);

  console.log("\n📋 Admin Credentials:");
  console.log("   Email:    a75318643@gmail.com");
  console.log("   Password: 1102005");
  console.log("\n🌱 Seeding complete! صناع الفرص is ready.");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
