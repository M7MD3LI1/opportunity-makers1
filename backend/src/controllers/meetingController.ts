import { Request, Response } from "express";
import prisma from "../config/db";

export const getNextMeeting = async (_req: Request, res: Response) => {
  try {
    const meeting = await (prisma as any).meeting.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ meeting });
  } catch (error) {
    console.error("Get meeting error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { title, link, date, time, active } = req.body;
    
    // We can either update the last one or create a new one
    // For simplicity, let's just create a new one and deactivate others or just handle one record
    await (prisma as any).meeting.updateMany({
      data: { active: false }
    });

    const meeting = await (prisma as any).meeting.create({
      data: {
        title,
        link,
        date,
        time,
        active: active !== undefined ? active : true
      }
    });

    res.json({ message: "Meeting updated", meeting });
  } catch (error) {
    console.error("Update meeting error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
