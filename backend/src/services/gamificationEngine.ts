import prisma from "../config/db";
import { updateUserScore, addScoreLog } from "./scoringEngine";

export async function checkAndAwardBadges(userId: number): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tasks: true,
      badges: { include: { badge: true } },
    },
  });

  if (!user) return [];

  const earnedKeys = user.badges.map((ub) => ub.badge.key);
  const newBadges: string[] = [];

  const allBadges = await prisma.badge.findMany();

  for (const badge of allBadges) {
    if (earnedKeys.includes(badge.key)) continue;

    let earned = false;

    switch (badge.key) {
      case "first_task":
        earned = user.tasks.length >= 1;
        break;
      case "fast_finisher":
        earned = user.tasks.filter((t) => t.isOnTime).length >= 3;
        break;
      case "consistent":
        // Active in last 30 days
        const daysSince = Math.floor(
          (Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24)
        );
        earned = user.tasks.length >= 5 && daysSince <= 30;
        break;
      case "smart_contributor":
        earned = user.score >= 70;
        break;
      case "top_performer":
        earned = user.score >= 90;
        break;
      case "team_player":
        earned = user.tasks.length >= 10;
        break;
    }

    if (earned) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });

      // Award bonus points for badge
      await addScoreLog(userId, badge.points, `حصل على شارة: ${badge.nameAr}`, "badge");

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          title: `🏆 شارة جديدة: ${badge.nameAr}`,
          message: `تهانينا! حصلت على شارة "${badge.nameAr}" ${badge.icon}`,
          type: "BADGE",
        },
      });

      newBadges.push(badge.key);
    }
  }

  if (newBadges.length > 0) {
    await updateUserScore(userId);
  }

  return newBadges;
}

export async function getLeaderboard(departmentId?: number) {
  const where: any = { status: "APPROVED", role: "USER" };
  if (departmentId) where.departmentId = departmentId;

  const users = await prisma.user.findMany({
    where,
    orderBy: { score: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      username: true,
      score: true,
      points: true,
      level: true,
      governorate: true,
      department: { select: { id: true, name: true } },
      badges: {
        include: { badge: { select: { icon: true, key: true, nameAr: true } } },
        orderBy: { earnedAt: "desc" },
        take: 3,
      },
    },
  });

  return users.map((u, index) => ({
    rank: index + 1,
    ...u,
  }));
}
