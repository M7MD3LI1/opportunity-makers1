import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { calculateVpi } from "../services/vpiEngine";

export const getMyVpiDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { month } = req.query; // e.g. "2026-04"
    const targetMonth = (month as string) || new Date().toISOString().slice(0, 7);

    let vpiRecord = await prisma.vpiRecord.findUnique({
      where: { userId_month: { userId: Number(userId), month: targetMonth } }
    });

    if (!vpiRecord) {
      // Calculate and create if it doesn't exist
      vpiRecord = await calculateVpi(Number(userId), targetMonth);
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { currentVpi: true, cumulativeVpi: true, totalVolunteerHours: true, requiredMonthlyHours: true, points: true }
    });

    const hours = await prisma.volunteerHour.findMany({
      where: { userId: Number(userId), month: targetMonth }
    });

    const history = await prisma.vpiRecord.findMany({
      where: { userId: Number(userId) },
      orderBy: { month: "asc" }
    });

    res.json({
      currentMonth: vpiRecord,
      userMetrics: user,
      hoursHistory: hours,
      vpiHistory: history
    });
  } catch (error) {
    console.error("Get VPI Dashboard error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const getVpiLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, departmentId } = req.query;
    const targetMonth = (month as string) || new Date().toISOString().slice(0, 7);

    const whereClause: any = { month: targetMonth };
    if (departmentId) {
      whereClause.user = { departmentId: Number(departmentId) };
    }

    const records = await prisma.vpiRecord.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, profilePicture: true, department: { select: { name: true } } } }
      },
      orderBy: { vpiScore: "desc" },
      take: 20
    });

    res.json({ leaderboard: records });
  } catch (error) {
    console.error("Get VPI Leaderboard error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};
