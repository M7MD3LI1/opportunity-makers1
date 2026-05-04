import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";

export const getChatStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "chat_enabled" } });
    res.json({ enabled: setting ? setting.value === "true" : true });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat status" });
  }
};

export const toggleChatStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }
    const { enabled } = req.body;
    await prisma.systemSetting.upsert({
      where: { key: "chat_enabled" },
      update: { value: String(enabled) },
      create: { key: "chat_enabled", value: String(enabled) }
    });
    res.json({ message: `Chat ${enabled ? "enabled" : "disabled"}` });
  } catch (error) {
    res.status(500).json({ message: "Error toggling chat status" });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.params;
    const depId = (departmentId && departmentId !== "null" && departmentId !== "general") 
      ? Number(departmentId) 
      : null;

    const messages = await prisma.chatMessage.findMany({
      where: { departmentId: depId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "asc" },
      take: 100
    });

    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    if (!content) { res.status(400).json({ message: "Content is required" }); return; }

    // Check if chat is enabled (Admins bypass this)
    if (req.user?.role !== "ADMIN") {
      const chatSetting = await prisma.systemSetting.findUnique({ where: { key: "chat_enabled" } });
      const isEnabled = chatSetting ? chatSetting.value === "true" : true;
      if (!isEnabled) {
        res.status(403).json({ message: "Chat is currently disabled by admin" });
        return;
      }
    }

    const depId = (departmentId && departmentId !== "null" && departmentId !== "general") 
      ? Number(departmentId) 
      : null;

    const message = await prisma.chatMessage.create({
      data: {
        content,
        userId: Number(userId),
        departmentId: depId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
