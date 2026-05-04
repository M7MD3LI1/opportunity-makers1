import prisma from "../config/db";

// Formula: VPI = (Task Performance × 0.5) + ((Monthly Points ÷ 100) × 4 × 0.3) + ((Completed Hours ÷ Required Hours) × 4 × 0.2)
export async function calculateVpi(userId: number, month: string): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tasks: {
        where: {
          createdAt: {
            gte: new Date(`${month}-01T00:00:00.000Z`),
            lt: new Date(new Date(`${month}-01T00:00:00.000Z`).setMonth(new Date(`${month}-01T00:00:00.000Z`).getMonth() + 1))
          }
        },
        include: { task: true }
      },
      volunteerHours: {
        where: { month, isApproved: true }
      },
      monthlyEvaluations: {
        where: { month }
      }
    }
  });

  if (!user) throw new Error("User not found");

  // 1. Task Performance (Weighted GPA)
  let totalTaskHours = 0;
  let totalWeightedGrade = 0;

  // Check if there's a manual evaluation summary
  const manualEval = await prisma.evaluation.findUnique({
    where: { userId_month: { userId, month } }
  });

  if (manualEval) {
    // Use manual evaluation data (Grade Points conversion)
    const getGradePoints = (score: number) => {
      if (score >= 13) return 4.0;
      if (score >= 10) return 3.0;
      if (score >= 7) return 2.0;
      if (score >= 5) return 1.0;
      return 0.0;
    };

    [1, 2, 3, 4, 5].forEach(i => {
      const s = (manualEval as any)[`task${i}Score`] || 0;
      const h = (manualEval as any)[`task${i}Hours`] || 0;
      if (h > 0) {
        totalTaskHours += h;
        totalWeightedGrade += (getGradePoints(s) * h);
      }
    });
  } else {
    // Fallback to automated calculation from individual submissions
    user.tasks.forEach(submission => {
      if (submission.gradeValue !== null) {
        const hours = submission.task.estimatedHours || 2;
        totalTaskHours += hours;
        totalWeightedGrade += (submission.gradeValue * hours);
      }
    });
  }

  const taskPerformance = totalTaskHours > 0 ? (totalWeightedGrade / totalTaskHours) : 0;

  // 2. Monthly Points
  const monthlyEvaluation = user.monthlyEvaluations[0];
  const monthlyPoints = manualEval ? manualEval.meetingScore : (monthlyEvaluation ? monthlyEvaluation.totalScore : 0);

  // 3. Completed Hours
  const completedHours = manualEval ? manualEval.meetingHours : user.volunteerHours.reduce((sum, h) => sum + h.hours, 0);
  const requiredHours = user.requiredMonthlyHours || 20;

  // Final VPI Calculation
  const vpiScore = 
    (taskPerformance * 0.5) + 
    ((Math.min(monthlyPoints, 100) / 100) * 4 * 0.3) + 
    (Math.min((completedHours / requiredHours), 1) * 4 * 0.2);

  // Get Bonus/Deductions from rewards and violations for the month
  const rewards = await prisma.reward.findMany({ where: { userId, month, type: "BONUS_POINTS" } });
  const violations = await prisma.violation.findMany({ where: { userId, month, type: "POINT_DEDUCTION" } });
  
  const bonusPoints = rewards.reduce((sum, r) => sum + r.value, 0);
  const deductions = violations.reduce((sum, v) => sum + v.pointsDeducted, 0);

  const finalVpiScore = Math.max(0, Math.min(4.0, vpiScore + (bonusPoints * 0.04) - (deductions * 0.04))); // Adjusting bonus/deductions to 4.0 scale roughly, or just calculating it into totalScore. We will keep it simple.

  const record = await prisma.vpiRecord.upsert({
    where: { userId_month: { userId, month } },
    update: {
      taskPerformance,
      monthlyPoints,
      completedHours,
      requiredHours,
      vpiScore: finalVpiScore,
      bonusPoints,
      deductions
    },
    create: {
      userId,
      month,
      taskPerformance,
      monthlyPoints,
      completedHours,
      requiredHours,
      vpiScore: finalVpiScore,
      bonusPoints,
      deductions
    }
  });

  // Update User's Cumulative VPI and Total Hours
  const allRecords = await prisma.vpiRecord.findMany({ where: { userId } });
  const cumulativeVpi = allRecords.reduce((sum, r) => sum + r.vpiScore, 0) / (allRecords.length || 1);
  const allHours = await prisma.volunteerHour.findMany({ where: { userId, isApproved: true } });
  const totalVolunteerHours = allHours.reduce((sum, h) => sum + h.hours, 0);

  await prisma.user.update({
    where: { id: userId },
    data: { currentVpi: finalVpiScore, cumulativeVpi, totalVolunteerHours }
  });

  return record;
}

export async function recalculateAllVpi(month: string) {
  const users = await prisma.user.findMany({ where: { status: "APPROVED", role: "USER" } });
  for (const user of users) {
    await calculateVpi(user.id, month);
  }
}
