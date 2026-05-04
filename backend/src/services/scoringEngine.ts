import prisma from "../config/db";

export interface ScoreBreakdown {
  tasks: number;
  deadlines: number;
  attendance: number;
  engagement: number;
  total: number;
}

// Formula: Tasks(40%) + Deadlines(30%) + Attendance(20%) + Engagement(10%)
export async function calculateUserScore(userId: number): Promise<ScoreBreakdown> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tasks: { include: { task: true } },
    },
  });

  if (!user) return { tasks: 0, deadlines: 0, attendance: 0, engagement: 0, total: 0 };

  // Tasks score: % of submitted tasks vs available tasks
  const departmentTaskCount = await prisma.task.count({
    where: {
      OR: [{ departmentId: null }, { departmentId: user.departmentId ?? undefined }],
    },
  });
  const submittedCount = user.tasks.length;
  const taskRate = departmentTaskCount > 0 ? (submittedCount / departmentTaskCount) * 100 : 0;

  // Deadline score: on-time submissions
  const onTimeCount = user.tasks.filter((s) => s.isOnTime).length;
  const deadlineRate = submittedCount > 0 ? (onTimeCount / submittedCount) * 100 : 0;

  // Attendance: based on lastActive recency (simple approximation)
  const daysSinceActive = Math.floor(
    (Date.now() - new Date(user.lastActive).getTime()) / (1000 * 60 * 60 * 24)
  );
  const attendanceRate = Math.max(0, 100 - daysSinceActive * 10);

  // Engagement: based on score logs count
  const logCount = await prisma.scoreLog.count({ where: { userId } });
  const engagementRate = Math.min(100, logCount * 10);

  // Fetch weights from settings
  const settingsArr = await (prisma as any).systemSetting.findMany({
    where: { key: { startsWith: "kpi_weight_" } }
  });
  const weights: Record<string, number> = {
    tasks: 0.4,
    deadlines: 0.3,
    attendance: 0.2,
    engagement: 0.1
  };
  settingsArr.forEach((s: any) => {
    const key = s.key.replace("kpi_weight_", "");
    weights[key] = (Number(s.value) || 0) / 100;
  });

  const total = Math.round(
    taskRate * weights.tasks + 
    deadlineRate * weights.deadlines + 
    attendanceRate * weights.attendance + 
    engagementRate * weights.engagement
  );

  return {
    tasks: Math.round(taskRate),
    deadlines: Math.round(deadlineRate),
    attendance: Math.round(attendanceRate),
    engagement: Math.round(engagementRate),
    total,
  };
}

export async function updateUserScore(userId: number): Promise<void> {
  const breakdown = await calculateUserScore(userId);
  const points = breakdown.total * 5;

  await prisma.user.update({
    where: { id: userId },
    data: {
      score: breakdown.total,
      points,
      level: getLevel(points),
    },
  });
}

export function getLevel(points: number): string {
  if (points >= 400) return "Leader";
  if (points >= 250) return "Pro";
  if (points >= 100) return "Intermediate";
  return "Beginner";
}

export function getLevelAr(level: string): string {
  const map: Record<string, string> = {
    Beginner: "مبتدئ",
    Intermediate: "متوسط",
    Pro: "محترف",
    Leader: "قائد",
  };
  return map[level] || level;
}

export function getNextLevelPoints(points: number): number {
  if (points < 100) return 100;
  if (points < 250) return 250;
  if (points < 400) return 400;
  return 500;
}

export async function addScoreLog(
  userId: number,
  delta: number,
  reason: string,
  category: string
): Promise<void> {
  await prisma.scoreLog.create({
    data: { userId, delta, reason, category },
  });
}
