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
  const email = "admin@sona3.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 12);
  const nationalId = encryptNationalId("12345678901234");

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      status: "APPROVED"
    },
    create: {
      email,
      name: "Main Admin",
      username: "admin_sona3",
      password: hashedPassword,
      nationalId,
      role: "ADMIN",
      status: "APPROVED",
      gender: "male",
      governorate: "Cairo",
      level: "Leader"
    }
  });

  console.log(`✅ Admin added/updated: ${admin.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
