import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user!.userId);
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Number(req.user!.userId);
    await prisma.notification.updateMany({
      where: { id: Number(id), userId },
      data: { isRead: true },
    });
    res.json({ message: "تم التحديث." });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user!.userId);
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "تم تحديد الكل كمقروء." });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم." });
  }
};
