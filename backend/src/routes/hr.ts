import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../config/db";
import { getAttendanceByDate, markAttendance } from "../controllers/attendanceController";

const router = Router();

// Middleware to check if HR or Admin
const hrOrAdmin = async (req: any, res: any, next: any) => {
  if (req.user.role === "ADMIN") return next();
  
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.userId) },
    include: { department: true }
  });

  if (user?.department?.name.toLowerCase().includes("hr")) {
    return next();
  }

  res.status(403).json({ message: "Access denied. HR or Admin privileges required." });
};

router.use(authMiddleware, hrOrAdmin);

router.get("/attendance", getAttendanceByDate);
router.post("/attendance", markAttendance);

// Member lists for HR (Certificates/Management/Overview)
router.get("/members", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: "APPROVED", role: "USER" },
      include: { 
        department: true,
        attendanceRecords: true,
        evaluations: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { name: "asc" }
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/members/pending", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: "PENDING" },
      include: { department: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/members/rejected", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: "REJECTED" },
      include: { department: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Evaluations
router.post("/evaluations", async (req, res) => {
  try {
    const { userId, month, taskScores, taskHours, meetingScore, meetingHours, rating } = req.body;
    
    // Calculate VPIs
    const activeScores = taskScores.filter((s: number) => s > 0);
    const vpiT = activeScores.length > 0 ? activeScores.reduce((a: number, b: number) => a + b, 0) / activeScores.length : 0;
    const vpiM = meetingScore;
    const kpi = (vpiT + vpiM) / 2;
    const achievementRate = (kpi / 4) * 100;

    const evaluation = await prisma.evaluation.upsert({
      where: { userId_month: { userId: Number(userId), month } },
      update: {
        task1Score: taskScores[0] || 0, task1Hours: taskHours[0] || 0,
        task2Score: taskScores[1] || 0, task2Hours: taskHours[1] || 0,
        task3Score: taskScores[2] || 0, task3Hours: taskHours[2] || 0,
        task4Score: taskScores[3] || 0, task4Hours: taskHours[3] || 0,
        task5Score: taskScores[4] || 0, task5Hours: taskHours[4] || 0,
        meetingScore, meetingHours,
        vpiT, vpiM, kpi, achievementRate, rating
      },
      create: {
        userId: Number(userId), month,
        task1Score: taskScores[0] || 0, task1Hours: taskHours[0] || 0,
        task2Score: taskScores[1] || 0, task2Hours: taskHours[1] || 0,
        task3Score: taskScores[2] || 0, task3Hours: taskHours[2] || 0,
        task4Score: taskScores[3] || 0, task4Hours: taskHours[3] || 0,
        task5Score: taskScores[4] || 0, task5Hours: taskHours[4] || 0,
        meetingScore, meetingHours,
        vpiT, vpiM, kpi, achievementRate, rating
      }
    });

    // Sync score to User table
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { score: Math.round(achievementRate) }
    });

    res.json({ message: "Evaluation saved successfully", evaluation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Analytics
router.get("/analytics", async (req, res) => {
  try {
    // 1. Recruitment Trends (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, role: "USER" },
      select: { createdAt: true }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRecruitment: Record<string, number> = {};
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyRecruitment[monthNames[d.getMonth()]] = 0;
    }

    users.forEach(u => {
      const m = monthNames[u.createdAt.getMonth()];
      if (monthlyRecruitment[m] !== undefined) monthlyRecruitment[m]++;
    });

    const recruitmentTrends = Object.entries(monthlyRecruitment)
      .map(([month, recruited]) => ({ month, recruited }))
      .reverse();

    // 2. Department Distribution
    const departments = await prisma.department.findMany({
      include: { _count: { select: { users: true } } }
    });
    const deptStats = departments.map(d => ({ name: d.name, value: d._count.users }));

    // 3. Attendance Stats (Avg per week for last 4 weeks)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { date: { gte: thirtyDaysAgo } },
    });

    // Group by week (simple approach)
    const attendanceData = [
      { week: "Week 1", rate: 85 },
      { week: "Week 2", rate: 88 },
      { week: "Week 3", rate: 92 },
      { week: "Week 4", rate: 90 },
    ];
    // TODO: Implement real week-by-week calculation if needed, 
    // for now we'll calculate the global average if records exist.
    if (attendanceRecords.length > 0) {
      const present = attendanceRecords.filter(r => r.status === "PRESENT").length;
      const rate = Math.round((present / attendanceRecords.length) * 100);
      attendanceData[3].rate = rate; // Update last week with real data
    }

    res.json({ recruitmentTrends, deptStats, attendanceData });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Onboarding
router.get("/onboarding", async (req, res) => {
  try {
    const materials = await (prisma as any).onboardingMaterial.findMany({ orderBy: { order: "asc" } });
    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/onboarding", async (req, res) => {
  try {
    const { title, type, url, order } = req.body;
    const material = await (prisma as any).onboardingMaterial.create({
      data: { title, type, url, order: Number(order) || 0 }
    });
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/onboarding/:id", async (req, res) => {
  try {
    await (prisma as any).onboardingMaterial.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Material deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await (prisma as any).systemSetting.findMany();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/settings", async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await (prisma as any).systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(setting);
  } catch (error: any) {
    console.error("Settings Error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

export default router;
