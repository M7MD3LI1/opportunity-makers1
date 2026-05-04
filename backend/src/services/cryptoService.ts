import crypto from "crypto";

const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || "SanaelForsa2026SecretKey32Chars!")
  .padEnd(32)
  .slice(0, 32);

export function encryptNationalId(nationalId: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(nationalId, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptNationalId(encrypted: string): string {
  try {
    const [ivHex, encryptedData] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "****";
  }
}

export function maskNationalId(nationalId: string): string {
  const decrypted = decryptNationalId(nationalId);
  if (decrypted === "****") return "****";
  return "**********" + decrypted.slice(-4);
}

export function validateEgyptianNationalId(nid: string): {
  valid: boolean;
  error?: string;
} {
  if (!/^\d{14}$/.test(nid)) {
    return { valid: false, error: "الرقم القومي يجب أن يتكون من 14 رقمًا" };
  }

  const centuryCode = parseInt(nid[0]);
  if (centuryCode !== 2 && centuryCode !== 3) {
    return { valid: false, error: "الرقم القومي غير صحيح" };
  }

  const year = parseInt(nid.slice(1, 3));
  const month = parseInt(nid.slice(3, 5));
  const day = parseInt(nid.slice(5, 7));

  if (month < 1 || month > 12) {
    return { valid: false, error: "تاريخ الميلاد في الرقم القومي غير صحيح" };
  }
  if (day < 1 || day > 31) {
    return { valid: false, error: "تاريخ الميلاد في الرقم القومي غير صحيح" };
  }

  return { valid: true };
}

export function generateUsername(fullName: string, id: number): string {
  const base = fullName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "");
  const slug = base || "user";
  return `${slug}.${id}`;
}

export function generateSecurePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$%&!";
  const all = upper + lower + digits + special;

  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
