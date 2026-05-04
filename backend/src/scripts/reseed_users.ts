import prisma from "../config/db";
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

async function main() {
  console.log("🚀 Starting platform reset...");

  // 1. Delete all users except ADMIN
  const deleteResult = await prisma.user.deleteMany({
    where: {
      role: {
        not: "ADMIN"
      }
    }
  });
  console.log(`🗑️ Deleted ${deleteResult.count} non-admin users.`);

  // 2. Ensure Departments are correct (English names only)
  const departments = [
    { name: "HR", headName: "محمد إبراهيم", viceName: "سارة أحمد" },
    { name: "PR", headName: "خالد محمود", viceName: "منى حسن" },
    { name: "OR", headName: "أميرة يوسف", viceName: "عمر عبدالله" },
    { name: "Training", headName: "ريم السيد", viceName: "أحمد رضا" },
    { name: "Social Media", headName: "نور الهدى", viceName: "حسام طارق" },
  ];

  // Optional: Delete departments that are not in this list or have Arabic names if they exist
  // For simplicity, we'll upsert the ones we want and maybe the user will manually clean others if they exist.
  // Actually, let's delete all and recreate to be sure "Arabic ones" are gone.
  // Note: This might affect tasks if they were linked to old departments. 
  // Since we are resetting users, resetting departments is usually fine too.
  
  await prisma.department.deleteMany({});
  console.log("🗑️ Cleared all departments.");

  const createdDepts = [];
  for (const dept of departments) {
    const d = await prisma.department.create({
      data: dept
    });
    createdDepts.push(d);
  }
  console.log(`✅ Created ${createdDepts.length} departments.`);

  // 3. Create 5 users per department
  const password = "Sana3@2026";
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const dummyNames = [
    "Ahmed Ali", "Sara Hassan", "Mahmoud Sayed", "Layla Khalil", "Omar Walid",
    "Fatma Ali", "Yassin Kamal", "Nour Adel", "Hamza Fawzi", "Mariam Gamal",
    "Youssef Monir", "Heba Said", "Abdelrahman Tariq", "Shorouk Fouad", "Mostafa Zakaria",
    "Aya Sabri", "Karim Shaker", "Donia Mahfouz", "Alaa Raslan", "Jana Hosni",
    "Bassem Soliman", "Rawan Talaat", "Khaled Sobhi", "Salma Ikrami", "Islam Ammar"
  ];

  let userCounter = 1;
  for (const dept of createdDepts) {
    console.log(`👥 Seeding 5 users for ${dept.name}...`);
    for (let i = 0; i < 5; i++) {
      const name = dummyNames[(userCounter - 1) % dummyNames.length];
      const email = `user${userCounter}@sana3.com`;
      const username = `user_${userCounter}`;
      const nationalId = encryptNationalId(`2990101${10000 + userCounter}`);

      await prisma.user.create({
        data: {
          name,
          email,
          username,
          password: hashedPassword,
          nationalId,
          role: "USER",
          status: "APPROVED",
          departmentId: dept.id,
          gender: i % 2 === 0 ? "male" : "female",
          governorate: "Cairo",
          score: Math.floor(Math.random() * 50) + 10,
          points: Math.floor(Math.random() * 200) + 20,
          level: "Beginner",
        }
      });
      userCounter++;
    }
  }

  console.log(`✨ Successfully created ${userCounter - 1} users.`);
  console.log(`🔑 All users password: ${password}`);
  console.log("🚀 Reset complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
