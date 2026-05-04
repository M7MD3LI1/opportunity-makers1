import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { calculateUserScore } from "../services/scoringEngine";
import { getLeaderboard } from "../services/gamificationEngine";

export const getMyScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user!.userId);
    const breakdown = await calculateUserScore(userId);
    const logs = await prisma.scoreLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { score: true, points: true, level: true },
    });

    res.json({ breakdown, logs, current: user });
  } catch (error) {
    console.error("My score error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getLeaderboardRoute = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
    const leaderboard = await getLeaderboard(departmentId);
    res.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const getMyBadges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user!.userId);
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });
    const allBadges = await prisma.badge.findMany();
    const earnedKeys = userBadges.map((ub) => ub.badge.key);

    res.json({
      earned: userBadges.map((ub) => ({ ...ub.badge, earnedAt: ub.earnedAt })),
      available: allBadges.filter((b) => !earnedKeys.includes(b.key)),
    });
  } catch (error) {
    console.error("My badges error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};
