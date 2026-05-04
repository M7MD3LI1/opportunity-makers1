import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";

export const applyRecruitment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const existingApp = await prisma.recruitmentApplication.findFirst({
      where: { userId: Number(userId) }
    });

    if (existingApp) {
      res.status(400).json({ message: "لديك طلب انضمام مسبق" });
      return;
    }

    const application = await prisma.recruitmentApplication.create({
      data: {
        userId: Number(userId),
        currentStage: "STAGE_1"
      }
    });

    res.status(201).json({ message: "تم تسجيل طلب الانضمام بنجاح", application });
  } catch (error) {
    console.error("Apply recruitment error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const getMyApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const application = await prisma.recruitmentApplication.findFirst({
      where: { userId: Number(userId) }
    });
    res.json({ application });
  } catch (error) {
    console.error("Get my application error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await prisma.recruitmentApplication.findMany({
      include: { user: { select: { id: true, name: true, email: true, gender: true, governorate: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json({ applications });
  } catch (error) {
    console.error("Get all applications error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const updateApplicationStage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body; // Allows updating scores, dates, boolean completions, and currentStage

    const application = await prisma.recruitmentApplication.update({
      where: { id: Number(id) },
      data
    });

    res.json({ message: "تم تحديث حالة الطلب بنجاح", application });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};
