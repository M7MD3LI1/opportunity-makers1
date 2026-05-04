import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { generateUserInsights, generateAdminInsights, processChatMessage, processPublicChatMessage } from "../services/aiEngine";
import prisma from "../config/db";

export const getInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user!.userId);
    const role = req.user!.role;
    let insights;

    if (role === "ADMIN") {
      insights = await generateAdminInsights();
    } else {
      insights = await generateUserInsights(userId);
    }

    res.json({ insights });
  } catch (error) {
    console.error("AI insights error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const chatMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;
    const userId = Number(req.user!.userId);

    if (!message || !message.trim()) {
      res.status(400).json({ message: "الرسالة مطلوبة." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });

    if (!user) {
      res.status(404).json({ message: "المستخدم غير موجود." });
      return;
    }

    const response = await processChatMessage(message, {
      userName: user.name,
      role: user.role,
      committeeId: user.departmentId ?? undefined,
      committeeName: user.department?.name,
      score: user.score,
      level: user.level,
    }, history);

    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const publicChat = async (req: any, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ message: "الرسالة مطلوبة." });
      return;
    }

    const response = await processPublicChatMessage(message, history);
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Public AI chat error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};
