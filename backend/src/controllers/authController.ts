import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db";
import { generateToken } from "../utils/jwt";
import {
  encryptNationalId,
  validateEgyptianNationalId,
} from "../services/cryptoService";
import {
  logActivity,
  detectAnomaly,
  checkBruteForce,
  recordFailedLogin,
  resetLoginAttempts,
} from "../services/securityService";
import { AuthRequest } from "../middleware/auth";

// Helper to sanitize string input
function sanitize(str: string): string {
  return str.trim().replace(/[<>"']/g, "");
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, nationalId, gender, governorate, departmentId, phone } = req.body;

    if (!name || !email || !nationalId || !gender || !governorate || !departmentId || !phone) {
      res.status(400).json({ message: "جميع الحقول مطلوبة، بما في ذلك رقم الهاتف." });
      return;
    }

    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email).toLowerCase();
    const cleanNid = sanitize(nationalId).replace(/\s/g, "");
    const cleanGender = sanitize(gender);
    const cleanGov = sanitize(governorate);
    const cleanPhone = sanitize(phone).replace(/\s/g, "");

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ message: "صيغة البريد الإلكتروني غير صحيحة." });
      return;
    }

    // Validate Egyptian National ID
    const nidValidation = validateEgyptianNationalId(cleanNid);
    if (!nidValidation.valid) {
      res.status(400).json({ message: nidValidation.error });
      return;
    }

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      res.status(409).json({ message: "هذا البريد الإلكتروني مسجل مسبقاً." });
      return;
    }

    // Check National ID uniqueness — encrypt first then compare stored
    const encryptedNid = encryptNationalId(cleanNid);

    // Check all existing users for same NID (we store it encrypted with unique constraint)
    // Since we use unique constraint on nationalId column which stores encrypted value,
    // we need a deterministic approach — use a hash for uniqueness check
    const crypto = await import("crypto");
    const nidHash = crypto.createHash("sha256").update(cleanNid).digest("hex");

    const existingNid = await prisma.user.findFirst({
      where: { nationalId: { contains: nidHash.slice(0, 8) } },
    });
    // Note: we embed a hash prefix in the encrypted value for fast duplicate check
    const finalEncryptedNid = nidHash.slice(0, 8) + ":" + encryptedNid;

    const existingNidCheck = await prisma.user.findFirst({
      where: { nationalId: { startsWith: nidHash.slice(0, 8) + ":" } },
    });
    if (existingNidCheck) {
      res.status(409).json({ message: "هذا الرقم القومي مسجل مسبقاً." });
      return;
    }

    // Check department exists
    const dept = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
    if (!dept) {
      res.status(404).json({ message: "اللجنة المختارة غير موجودة." });
      return;
    }

    // Create user (no password yet — admin will generate)
    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        nationalId: finalEncryptedNid,
        gender: cleanGender,
        governorate: cleanGov,
        phone: cleanPhone,
        departmentId: Number(departmentId),
        role: "USER",
        status: "PENDING",
        // Automatically start recruitment process
        recruitmentApplications: {
          create: {
            currentStage: "STAGE_1"
          }
        }
      },
    });

    await logActivity({
      userId: user.id,
      action: "SIGNUP",
      details: `New registration from ${cleanGov}`,
      severity: "INFO",
    });

    res.status(201).json({
      message: "تم تقديم طلب الانضمام بنجاح. سيتم مراجعته من قبل الإدارة.",
      user: { id: user.id, name: user.name, email: user.email, status: user.status },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    if (!email || !password) {
      res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان." });
      return;
    }

    // Find by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: email }],
      },
    });

    if (!user) {
      await logActivity({ action: "LOGIN_FAIL", details: `Unknown email: ${email}`, ip, severity: "WARNING" });
      res.status(401).json({ message: "بيانات الدخول غير صحيحة." });
      return;
    }

    // Brute force check
    const bruteCheck = await checkBruteForce(user.id);
    if (bruteCheck.locked) {
      res.status(429).json({
        message: `تم تجميد الحساب مؤقتاً. حاول مرة أخرى بعد ${bruteCheck.remainingMinutes} دقيقة.`,
        lockedMinutes: bruteCheck.remainingMinutes,
      });
      return;
    }

    if (!user.password) {
      res.status(401).json({ message: "بيانات الدخول غير صحيحة." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await recordFailedLogin(user.id);
      await logActivity({ userId: user.id, action: "LOGIN_FAIL", ip, severity: "WARNING" });
      res.status(401).json({ message: "بيانات الدخول غير صحيحة." });
      return;
    }

    if (user.status === "PENDING") {
      res.status(403).json({ message: "حسابك قيد المراجعة. انتظر موافقة الإدارة." });
      return;
    }
    if (user.status === "REJECTED") {
      res.status(403).json({ message: "تم رفض طلبك من قبل الإدارة." });
      return;
    }

    // Reset login attempts
    await resetLoginAttempts(user.id);

    // Anomaly detection
    await detectAnomaly({ userId: user.id, ip, lastIp: user.lastLoginIp });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date(), lastLoginIp: ip },
    });

    await logActivity({ userId: user.id, action: "LOGIN_SUCCESS", ip, severity: "INFO" });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    const department = user.departmentId
      ? await prisma.department.findUnique({ where: { id: user.departmentId } })
      : null;

    res.json({
      message: "تم تسجيل الدخول بنجاح.",
      token,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        score: user.score,
        points: user.points,
        level: user.level,
        gender: user.gender,
        governorate: user.governorate,
        phone: user.phone,
        departmentId: user.departmentId,
        department,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "كلمة المرور الحالية والجديدة مطلوبتان." });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.password) {
      res.status(404).json({ message: "المستخدم غير موجود." });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة." });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: hashed, mustChangePassword: false },
    });

    await logActivity({ userId: Number(userId), action: "PASSWORD_CHANGED", severity: "INFO" });

    res.json({ message: "تم تغيير كلمة المرور بنجاح." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        department: true,
        badges: { include: { badge: true }, orderBy: { earnedAt: "desc" } },
      },
    });

    if (!user) {
      res.status(404).json({ message: "المستخدم غير موجود." });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        score: user.score,
        points: user.points,
        level: user.level,
        gender: user.gender,
        governorate: user.governorate,
        phone: user.phone,
        departmentId: user.departmentId,
        department: user.department,
        mustChangePassword: user.mustChangePassword,
        profilePicture: user.profilePicture,
        badges: user.badges.map((ub) => ub.badge),
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};
