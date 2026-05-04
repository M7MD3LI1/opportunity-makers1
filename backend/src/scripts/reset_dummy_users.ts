import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();
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

async function main() {
  console.log("🧹 Cleaning up existing dummy users...");
  
  // Delete all users except Admin
  const deleted = await prisma.user.deleteMany({
    where: {
      role: "USER"
    }
  });
  console.log(`✅ Deleted ${deleted.count} existing users.`);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash("Sana3Admin2024!", salt);

  const depts = await prisma.department.findMany();
  if (depts.length === 0) {
    console.error("❌ No departments found. Please run main seed first.");
    return;
  }

  const dummyNames = [
    "أحمد علي", "سارة محمد", "يوسف محمود", "ليلى خالد", "عمر إبراهيم",
    "فاطمة الزهراء", "ياسين كمال", "نور عادل", "حمزة فوزي", "مريم جمال",
    "يوسف منير", "هبة سعيد", "عبد الرحمن طارق", "شروق فؤاد", "مصطفى زكريا",
    "آية صبري", "كريم شاكر", "دنيا محفوظ", "علاء رسلان", "جنا حسني",
    "باسم سليمان", "روان طلعت", "خالد صبحي", "سلمى إكرامي", "إاسلام عمار"
  ];

  console.log("👥 Creating 5 users per committee...");
  let userIndex = 0;

  for (const dept of depts) {
    console.log(`   - Seeding ${dept.name}...`);
    for (let i = 1; i <= 5; i++) {
      const email = `user${userIndex + 1}@sana3.com`;
      const name = dummyNames[userIndex] || `User ${userIndex + 1}`;
      const nid = encryptNationalId(`2990101${10000 + userIndex}`);
      
      await prisma.user.create({
        data: {
          name,
          email,
          username: `user_${userIndex + 1}`,
          password: hashedPassword,
          nationalId: nid,
          role: "USER",
          status: "APPROVED",
          departmentId: dept.id,
          gender: i % 2 === 0 ? "female" : "male",
          governorate: "القاهرة",
          score: 85,
          points: 100,
          level: "Member"
        }
      });
      userIndex++;
    }
  }

  console.log(`\n✨ Successfully created ${userIndex} users (5 per committee).`);
  console.log("🚀 Database is ready with fresh dummy data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
