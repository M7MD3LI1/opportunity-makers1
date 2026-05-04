import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { calculateVpi } from "../services/vpiEngine";

export const getMyEvaluations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const evaluations = await prisma.monthlyEvaluation.findMany({
      where: { userId: Number(userId) },
      orderBy: { month: "desc" }
    });
    res.json({ evaluations });
  } catch (error) {
    console.error("Get my evaluations error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const getEvaluations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month } = req.query;
    if (!month) {
      res.status(400).json({ message: "الشهر مطلوب" });
      return;
    }

    const evaluations = await prisma.monthlyEvaluation.findMany({
      where: { month: String(month) },
      include: { 
        user: { 
          include: { 
            department: true
          } 
        } 
      }
    });

    res.json({ evaluations });
  } catch (error) {
    console.error("Get evaluations error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const updateEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, month, criteria } = req.body;
    
    // criteria is expected to be an object with 10 fields, each out of 10.
    const {
      attendance = 0,
      taskCompletion = 0,
      timeCommitment = 0,
      reportQuality = 0,
      technicalSkills = 0,
      professionalConduct = 0,
      innovation = 0,
      policyCompliance = 0,
      teamCollaboration = 0,
      positiveContribution = 0
    } = criteria || {};

    const totalScore = 
      Number(attendance) + Number(taskCompletion) + Number(timeCommitment) + Number(reportQuality) +
      Number(technicalSkills) + Number(professionalConduct) + Number(innovation) +
      Number(policyCompliance) + Number(teamCollaboration) + Number(positiveContribution);

    const evaluation = await prisma.monthlyEvaluation.upsert({
      where: { userId_month: { userId: Number(userId), month: String(month) } },
      update: {
        attendance: Number(attendance),
        taskCompletion: Number(taskCompletion),
        timeCommitment: Number(timeCommitment),
        reportQuality: Number(reportQuality),
        technicalSkills: Number(technicalSkills),
        professionalConduct: Number(professionalConduct),
        innovation: Number(innovation),
        policyCompliance: Number(policyCompliance),
        teamCollaboration: Number(teamCollaboration),
        positiveContribution: Number(positiveContribution),
        totalScore,
        evaluatorId: req.user?.userId
      },
      create: {
        userId: Number(userId),
        month: String(month),
        attendance: Number(attendance),
        taskCompletion: Number(taskCompletion),
        timeCommitment: Number(timeCommitment),
        reportQuality: Number(reportQuality),
        technicalSkills: Number(technicalSkills),
        professionalConduct: Number(professionalConduct),
        innovation: Number(innovation),
        policyCompliance: Number(policyCompliance),
        teamCollaboration: Number(teamCollaboration),
        positiveContribution: Number(positiveContribution),
        totalScore,
        evaluatorId: req.user?.userId
      }
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: Number(userId),
        title: "⭐ تقييم جديد",
        message: `تم إصدار تقييمك لشهر ${month} بنتيجة ${totalScore}/100.`,
        type: "INFO"
      }
    });

    // Recalculate VPI
    await calculateVpi(Number(userId), String(month));

    res.json({ message: "تم تحديث التقييم وتحديث مؤشر VPI بنجاح", evaluation });
  } catch (error) {
    console.error("Update evaluation error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const updateVpiEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, month, taskScores, taskHours, monthlyPoints, completedHours, requiredHours } = req.body;

    // 1. Update Evaluation record (for history and detailed breakdown)
    const evaluation = await prisma.evaluation.upsert({
      where: { userId_month: { userId: Number(userId), month: String(month) } },
      update: {
        task1Score: Number(taskScores.task1), task1Hours: Number(taskHours.task1),
        task2Score: Number(taskScores.task2), task2Hours: Number(taskHours.task2),
        task3Score: Number(taskScores.task3), task3Hours: Number(taskHours.task3),
        task4Score: Number(taskScores.task4), task4Hours: Number(taskHours.task4),
        task5Score: Number(taskScores.task5), task5Hours: Number(taskHours.task5),
        meetingScore: Number(monthlyPoints), // Reusing meetingScore for monthlyPoints
        meetingHours: Number(completedHours), // Reusing meetingHours for completedHours
      },
      create: {
        userId: Number(userId),
        month: String(month),
        task1Score: Number(taskScores.task1), task1Hours: Number(taskHours.task1),
        task2Score: Number(taskScores.task2), task2Hours: Number(taskHours.task2),
        task3Score: Number(taskScores.task3), task3Hours: Number(taskHours.task3),
        task4Score: Number(taskScores.task4), task4Hours: Number(taskHours.task4),
        task5Score: Number(taskScores.task5), task5Hours: Number(taskHours.task5),
        meetingScore: Number(monthlyPoints),
        meetingHours: Number(completedHours),
      }
    });

    // 2. Manual calculation of Task Performance (GPA) for VpiRecord
    const getGradePoints = (score: number) => {
      if (score >= 13) return 4.0;
      if (score >= 10) return 3.0;
      if (score >= 7) return 2.0;
      if (score >= 5) return 1.0;
      return 0.0;
    };

    let totalTaskHours = 0;
    let totalWeightedPoints = 0;

    [1, 2, 3, 4, 5].forEach(i => {
      const s = Number(taskScores[`task${i}`]) || 0;
      const h = Number(taskHours[`task${i}`]) || 0;
      if (h > 0) {
        totalTaskHours += h;
        totalWeightedPoints += (getGradePoints(s) * h);
      }
    });

    const taskPerformance = totalTaskHours > 0 ? (totalWeightedPoints / totalTaskHours) : 0;
    
    // 3. Final VPI Calculation (matching frontend preview)
    const vpiScore = 
      (taskPerformance * 0.5) + 
      ((Math.min(monthlyPoints, 100) / 100) * 1.2) + 
      (Math.min((completedHours / (requiredHours || 20)), 1.2) * 0.8);

    // 4. Update or Create VpiRecord
    const vpiRecord = await prisma.vpiRecord.upsert({
      where: { userId_month: { userId: Number(userId), month: String(month) } },
      update: {
        taskPerformance,
        monthlyPoints: Number(monthlyPoints),
        completedHours: Number(completedHours),
        requiredHours: Number(requiredHours),
        vpiScore: Math.min(4.0, vpiScore)
      },
      create: {
        userId: Number(userId),
        month: String(month),
        taskPerformance,
        monthlyPoints: Number(monthlyPoints),
        completedHours: Number(completedHours),
        requiredHours: Number(requiredHours),
        vpiScore: Math.min(4.0, vpiScore)
      }
    });

    // 5. Update User cumulative VPI
    const allRecords = await prisma.vpiRecord.findMany({ where: { userId: Number(userId) } });
    const cumulativeVpi = allRecords.reduce((sum, r) => sum + r.vpiScore, 0) / (allRecords.length || 1);
    
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { currentVpi: vpiRecord.vpiScore, cumulativeVpi }
    });

    res.json({ message: "تم تحديث بيانات VPI بنجاح", vpiRecord });
  } catch (error) {
    console.error("Update VPI error:", error);
    res.status(500).json({ message: "خطأ في تحديث بيانات VPI" });
  }
};
