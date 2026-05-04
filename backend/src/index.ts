import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import departmentRoutes from "./routes/departments";
import imagesRoutes from "./routes/images";
import taskRoutes from "./routes/tasks";
import meetingsRoutes from "./routes/meetings";
import scoringRoutes from "./routes/scoring";
import aiRoutes from "./routes/ai";
import notificationRoutes from "./routes/notifications";
import userRoutes from "./routes/users";
import chatRoutes from "./routes/chat";
import evaluationRoutes from "./routes/evaluations";
import vpiRoutes from "./routes/vpi";
import documentsRoutes from "./routes/documents";
import recruitmentRoutes from "./routes/recruitment";
import hrRoutes from "./routes/hr";
import prRoutes from "./routes/pr";
import orRoutes from "./routes/or";
import trainingRoutes from "./routes/training";
import socialRoutes from "./routes/social";

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.APP_URL || "http://localhost:5173",
  ],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "عدد كبير جداً من المحاولات. حاول مرة أخرى بعد 15 دقيقة." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/images", imagesRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/meetings", meetingsRoutes);
app.use("/api/scoring", scoringRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/vpi", vpiRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/pr", prRoutes);
app.use("/api/or", orRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/social", socialRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", platform: "صناع الفرص", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "خطأ داخلي في الخادم." });
});

app.listen(PORT, async () => {
  console.log(`🚀 صناع الفرص API running on http://localhost:${PORT}`);
  
  // SEED DUMMY USERS (5 per department)
  const prisma = new PrismaClient();
  try {
    const departments = await prisma.department.findMany();
    const dummyCount = await prisma.user.count({ where: { role: "USER" } });
    
    if (dummyCount < 25 && departments.length > 0) {
      console.log("👥 Seeding 25 dummy users (5 per department)...");
      const hashedPassword = await bcrypt.hash("Sana3@2026", 12);
      const names = [
        "Ahmed Ali", "Sara Hassan", "Mahmoud Sayed", "Layla Khalil", "Omar Walid",
        "Fatma Ali", "Yassin Kamal", "Nour Adel", "Hamza Fawzi", "Mariam Gamal",
        "Youssef Monir", "Heba Said", "Abdelrahman Tariq", "Shorouk Fouad", "Mostafa Zakaria",
        "Aya Sabri", "Karim Shaker", "Donia Mahfouz", "Alaa Raslan", "Jana Hosni",
        "Bassem Soliman", "Rawan Talaat", "Khaled Sobhi", "Salma Ikrami", "Islam Ammar"
      ];
      
      let userCounter = 0;
      for (const dept of departments) {
        for (let i = 0; i < 5; i++) {
          const email = `user${userCounter + 1}@sana3.com`;
          await prisma.user.upsert({
            where: { email },
            update: { departmentId: dept.id, status: "APPROVED", role: "USER" },
            create: {
              name: names[userCounter % names.length],
              email,
              username: `user_${userCounter + 1}`,
              password: hashedPassword,
              nationalId: `DUMMY_ID_${userCounter + 1}`,
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
      console.log(`✅ ${userCounter} users synchronized.`);
    }
  } catch (e) {
    console.error("Error during auto-seeding:", e);
  }
  
  // ONE-TIME ADMIN SEEDING
  const admins = [
    { name: "Main Admin", email: "admin@sana3.com", phone: "01000000000" },
    { name: "Mohamed Gamal", email: "mohamed.gamal@sana3.com", phone: "01000000001" },
    { name: "Ahmed Nader", email: "ahmed.nader@sana3.com", phone: "01000000002" },
    { name: "Sara Eid", email: "sara.eid@sana3.com", phone: "01000000003" },
  ];
  const hashedPassword = await bcrypt.hash("Sana3Admin2024!", 10);
  for (const admin of admins) {
    try {
      const exists = await prisma.user.findUnique({ where: { email: admin.email } });
      if (!exists) {
        await prisma.user.create({
          data: {
            ...admin,
            password: hashedPassword,
            role: "ADMIN",
            status: "APPROVED",
            nationalId: `ADMIN_${admin.name.replace(" ", "_")}`,
            governorate: "Cairo",
            gender: "male",
            mustChangePassword: true
          }
        });
        console.log(`✅ Created Admin: ${admin.name}`);
      }
    } catch (e) { console.error("Error seeding admin:", e); }
  }
  await prisma.$disconnect();
});

export default app;
