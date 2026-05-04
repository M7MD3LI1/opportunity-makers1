import { Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { generateUsername, generateSecurePassword, maskNationalId, decryptNationalId } from "../services/cryptoService";
import { sendApprovalEmail, sendRejectionEmail } from "../services/emailService";
import { logActivity } from "../services/securityService";
import { updateUserScore } from "../services/scoringEngine";

// ─── User Management ──────────────────────────────────────────────────────────

export const getPendingUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { status: "PENDING" },
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        gender: u.gender,
        governorate: u.governorate,
        nationalIdMasked: maskNationalId(u.nationalId),
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        department: u.department,
        departmentId: u.departmentId,
      })),
    });
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getApprovedUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { status: "APPROVED", role: "USER" },
      include: {
        department: true,
        badges: { include: { badge: true }, take: 3, orderBy: { earnedAt: "desc" } },
        tasks: true,
      },
      orderBy: { score: "desc" },
    });

    res.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        gender: u.gender,
        governorate: u.governorate,
        nationalIdMasked: maskNationalId(u.nationalId),
        role: u.role,
        status: u.status,
        score: u.score,
        points: u.points,
        level: u.level,
        createdAt: u.createdAt,
        lastActive: u.lastActive,
        department: u.department,
        departmentId: u.departmentId,
        taskCount: u.tasks.length,
        badges: u.badges.map((ub) => ub.badge),
      })),
    });
  } catch (error) {
    console.error("Get approved users error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getRejectedUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { status: "REJECTED" },
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        gender: u.gender,
        governorate: u.governorate,
        rejectionReason: u.rejectionReason,
        status: u.status,
        createdAt: u.createdAt,
        department: u.department,
      })),
    });
  } catch (error) {
    console.error("Get rejected users error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getUserFullProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { 
        department: true,
        attendanceRecords: true,
        evaluations: {
          orderBy: { month: "desc" }
        }
      },
    });

    if (!user) {
      res.status(404).json({ message: "المستخدم غير موجود." });
      return;
    }

    // Log sensitive data access
    await logActivity({
      userId: adminId,
      action: "VIEW_SENSITIVE_DATA",
      details: `Admin viewed full profile of user ID: ${id}`,
      severity: "WARNING",
    });

    res.json({
      user: {
        ...user,
        password: undefined,
        nationalIdDecrypted: decryptNationalId(user.nationalId.includes(":") ? user.nationalId.split(":").slice(1).join(":") : user.nationalId),
      },
    });
  } catch (error) {
    console.error("Get user full profile error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const approveUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      res.status(404).json({ message: "المستخدم غير موجود." });
      return;
    }
    if (user.status !== "PENDING") {
      res.status(400).json({ message: `الحساب بالفعل في حالة: ${user.status}` });
      return;
    }

    // Generate username & password
    const username = generateUsername(user.name, user.id);
    const tempPassword = generateSecurePassword();
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(tempPassword, salt);

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        status: "APPROVED",
        username,
        password: hashed,
        mustChangePassword: true,
      },
    });

    // Send approval email
    const emailResult = await sendApprovalEmail({
      to: user.email,
      name: user.name,
      username,
      password: tempPassword,
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "🎉 مرحباً بك في صناع الفرص!",
        message: `تمت الموافقة على طلب انضمامك. بيانات دخولك أُرسلت إلى بريدك الإلكتروني.`,
        type: "INFO",
      },
    });

    await logActivity({
      userId: adminId,
      action: "APPROVE_USER",
      details: `Approved user ID: ${id} | Username: ${username}`,
      severity: "INFO",
    });

    res.json({
      message: "تمت الموافقة على العضو بنجاح.",
      user: { id: updated.id, name: updated.name, email: updated.email, username, status: updated.status },
      credentials: { username, tempPassword },
      emailSent: emailResult.sent,
      emailNote: !emailResult.sent
        ? "تعذر إرسال البريد الإلكتروني. احتفظ ببيانات الدخول المؤقتة."
        : undefined,
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const rejectUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      res.status(404).json({ message: "المستخدم غير موجود." });
      return;
    }
    if (user.status !== "PENDING") {
      res.status(400).json({ message: `الحساب بالفعل في حالة: ${user.status}` });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { status: "REJECTED", rejectionReason: reason || null },
    });

    await sendRejectionEmail({ to: user.email, name: user.name, reason });

    await logActivity({
      userId: adminId,
      action: "REJECT_USER",
      details: `Rejected user ID: ${id} | Reason: ${reason || "N/A"}`,
      severity: "INFO",
    });

    res.json({ message: "تم رفض العضو.", user: { id: updated.id, status: updated.status } });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const revokeUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) { res.status(404).json({ message: "المستخدم غير موجود." }); return; }
    if (user.role === "ADMIN") { res.status(403).json({ message: "لا يمكن حذف مسؤول." }); return; }

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "تم حذف العضو بنجاح." });
  } catch (error) {
    console.error("Revoke user error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

// ─── KPI & Analytics ──────────────────────────────────────────────────────────

export const getKpiDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        users: { where: { status: "APPROVED" }, include: { tasks: true } },
        tasks: { include: { submissions: true } },
        kpiSnapshots: { orderBy: { createdAt: "asc" } },
      },
    });

    const data = departments.map((dept) => {
      const memberCount = dept.users.length;
      const taskCount = dept.tasks.length;
      const totalSubmissions = dept.tasks.reduce((acc, t) => acc + t.submissions.length, 0);
      const completionRate = taskCount > 0 ? Math.round((totalSubmissions / Math.max(taskCount * memberCount, 1)) * 100) : 0;
      const avgScore = memberCount > 0
        ? Math.round(dept.users.reduce((acc, u) => acc + u.score, 0) / memberCount)
        : 0;
      const onTimeSubmissions = dept.tasks.reduce(
        (acc, t) => acc + t.submissions.filter((s) => s.isOnTime).length, 0
      );
      const deadlineRate = totalSubmissions > 0 ? Math.round((onTimeSubmissions / totalSubmissions) * 100) : 0;

      return {
        id: dept.id,
        name: dept.name,
        memberCount,
        taskCount,
        completionRate,
        avgScore,
        deadlineRate,
        kpiHistory: dept.kpiSnapshots.slice(-6),
      };
    });

    res.json({ departments: data });
  } catch (error) {
    console.error("KPI dashboard error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { status: "APPROVED", role: "USER" },
      select: { governorate: true, gender: true, score: true, level: true, departmentId: true, createdAt: true },
    });

    // Governorate distribution
    const govMap: Record<string, number> = {};
    users.forEach((u) => { govMap[u.governorate] = (govMap[u.governorate] || 0) + 1; });
    const governorateData = Object.entries(govMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Gender breakdown
    const genderMap: Record<string, number> = {};
    users.forEach((u) => { genderMap[u.gender] = (genderMap[u.gender] || 0) + 1; });

    // Level distribution
    const levelMap: Record<string, number> = {};
    users.forEach((u) => { levelMap[u.level] = (levelMap[u.level] || 0) + 1; });

    // Score distribution
    const scoreRanges = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };
    users.forEach((u) => {
      if (u.score <= 25) scoreRanges["0-25"]++;
      else if (u.score <= 50) scoreRanges["26-50"]++;
      else if (u.score <= 75) scoreRanges["51-75"]++;
      else scoreRanges["76-100"]++;
    });

    // Monthly registrations
    const monthMap: Record<string, number> = {};
    users.forEach((u) => {
      const month = new Date(u.createdAt).toLocaleDateString("ar-EG", { month: "short", year: "numeric" });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    res.json({
      totalMembers: users.length,
      governorateData,
      genderData: Object.entries(genderMap).map(([name, value]) => ({ name: name === "male" ? "ذكر" : "أنثى", value })),
      levelData: Object.entries(levelMap).map(([name, value]) => ({ name, value })),
      scoreDistribution: Object.entries(scoreRanges).map(([range, count]) => ({ range, count })),
      monthlyRegistrations: Object.entries(monthMap).map(([month, count]) => ({ month, count })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const logs = await prisma.activityLog.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.activityLog.count();

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Activity logs error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

// ─── Image Management ─────────────────────────────────────────────────────────

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ message: "لا يوجد ملف صورة." }); return; }
    const { description } = req.body;
    const userId = req.user!.userId;
    const image = await prisma.image.create({
      data: { url: `/uploads/${req.file.filename}`, description: description || null, uploadedBy: userId },
    });
    res.status(201).json({ message: "تم رفع الصورة بنجاح.", image });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getImages = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const images = await prisma.image.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ images });
  } catch (error) {
    console.error("Get images error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const deleteImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const image = await prisma.image.findUnique({ where: { id: Number(id) } });
    if (!image) { res.status(404).json({ message: "الصورة غير موجودة." }); return; }
    await prisma.image.delete({ where: { id: Number(id) } });
    res.json({ message: "تم حذف الصورة بنجاح." });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getExecutiveStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [partners, sponsorships, events, inventory, courses, socialContent, recruitment] = await Promise.all([
      prisma.partner.count(),
      prisma.sponsorship.aggregate({ _sum: { amount: true } }),
      prisma.event.count(),
      prisma.inventoryItem.count(),
      prisma.course.count(),
      prisma.socialContent.count(),
      prisma.recruitmentApplication.count(),
    ]);

    const stats = [
      { 
        id: "pr", 
        name: "العلاقات العامة", 
        metrics: [
          { label: "الشركاء", value: partners }, 
          { label: "إجمالي الرعاية", value: sponsorships._sum.amount || 0, format: "currency" }
        ] 
      },
      { 
        id: "or", 
        name: "العمليات", 
        metrics: [
          { label: "الفعاليات", value: events }, 
          { label: "العهد والمخزون", value: inventory }
        ] 
      },
      { 
        id: "training", 
        name: "التدريب", 
        metrics: [
          { label: "الدورات المتاحة", value: courses },
          { label: "المتدربين النشطين", value: 124 } // Mock for now
        ] 
      },
      { 
        id: "social", 
        name: "التواصل الاجتماعي", 
        metrics: [
          { label: "منشورات مجدولة", value: socialContent },
          { label: "إجمالي الوصول", value: "1.2M" }
        ] 
      },
      { 
        id: "hr", 
        name: "الموارد البشرية", 
        metrics: [
          { label: "طلبات التوظيف", value: recruitment },
          { label: "معدل الاستبقاء", value: "94%" }
        ] 
      }
    ];

    res.json({ stats });
  } catch (error) {
    console.error("Executive stats error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};
