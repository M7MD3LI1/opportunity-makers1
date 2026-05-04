import { Router, Response } from "express";
import prisma from "../config/db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Get all images (Public)
router.get("/", async (_req: AuthRequest, res: Response) => {
  try {
    const images = await prisma.image.findMany({
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ images });
  } catch (error) {
    console.error("Get public images error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
