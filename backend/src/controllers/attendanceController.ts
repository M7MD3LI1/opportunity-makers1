import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { updateUserScore, addScoreLog } from "../services/scoringEngine";

export const getAttendanceByDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      res.status(400).json({ message: "Date is required (YYYY-MM-DD)" });
      return;
    }

    const users = await prisma.user.findMany({
      where: { status: "APPROVED", role: "USER" },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        department: { select: { id: true, name: true } } 
      },
      orderBy: { name: "asc" },
    });

    const records = await prisma.attendanceRecord.findMany({
      where: { date: String(date) },
    });

    res.json({ users, records });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, records } = req.body; 
    // records: [{ userId: number, status: "PRESENT" | "ABSENT" | "EXCUSED", excuse?: string, weight?: number }]
    
    if (!date || !Array.isArray(records)) {
      res.status(400).json({ message: "Invalid data format. Expected { date: string, records: Array }" });
      return;
    }

    const results = await Promise.all(
      records.map(async (rec) => {
        const weight = rec.weight ?? 1.0;
        
        const result = await prisma.attendanceRecord.upsert({
          where: { userId_date: { userId: rec.userId, date } },
          update: { 
            status: rec.status, 
            excuse: rec.excuse || null, 
            weight: weight 
          },
          create: { 
            userId: rec.userId, 
            date, 
            status: rec.status, 
            excuse: rec.excuse || null, 
            weight: weight 
          },
        });

        // Award points for attendance if PRESENT
        if (rec.status === "PRESENT") {
            const basePoints = 5;
            const awardedPoints = Math.round(basePoints * weight);
            
            // Check if we already awarded points for this date to avoid duplicates if re-marking
            const existingLog = await prisma.scoreLog.findFirst({
                where: {
                    userId: rec.userId,
                    category: "attendance",
                    reason: { contains: date }
                }
            });

            if (!existingLog) {
                await addScoreLog(rec.userId, awardedPoints, `Attendance on ${date}`, "attendance");
                await updateUserScore(rec.userId);
            }
        } else if (rec.status === "ABSENT") {
            // Deduct some points or just log it
            const deduction = -2;
            const existingLog = await prisma.scoreLog.findFirst({
                where: {
                    userId: rec.userId,
                    category: "attendance",
                    reason: { contains: `${date} (ABSENT)` }
                }
            });
            
            if (!existingLog) {
                await addScoreLog(rec.userId, deduction, `Absence on ${date} (ABSENT)`, "attendance");
                await updateUserScore(rec.userId);
            }
        }

        return result;
      })
    );

    res.json({ 
      message: "تم تسجيل الحضور بنجاح.", 
      count: results.length 
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};
