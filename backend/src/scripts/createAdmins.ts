import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmins() {
  const admins = [
    { name: "Mohamed Gamal", email: "mohamed.gamal@sana3.com", phone: "01000000001" },
    { name: "Ahmed Nader", email: "ahmed.nader@sana3.com", phone: "01000000002" },
    { name: "Sara Eid", email: "sara.eid@sana3.com", phone: "01000000003" },
  ];

  const defaultPassword = "Sana3Admin2024!";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  console.log("Starting Admin Creation...");

  for (const admin of admins) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: admin.email } });
      if (existing) {
        console.log(`Admin ${admin.name} already exists. Updating role...`);
        await prisma.user.update({
          where: { email: admin.email },
          data: { role: "ADMIN", status: "APPROVED" }
        });
      } else {
        await prisma.user.create({
          data: {
            name: admin.name,
            email: admin.email,
            password: hashedPassword,
            phone: admin.phone,
            role: "ADMIN",
            status: "APPROVED",
            nationalId: `ADMIN_${admin.name.replace(" ", "_")}`,
            governorate: "Cairo",
            gender: "male",
            mustChangePassword: true
          }
        });
        console.log(`Admin ${admin.name} created successfully.`);
      }
    } catch (error) {
      console.error(`Error creating admin ${admin.name}:`, error);
    }
  }

  console.log("Admin Creation Finished.");
  await prisma.$disconnect();
}

createAdmins();
