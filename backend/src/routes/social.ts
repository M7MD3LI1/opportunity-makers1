import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../config/db";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/social/assets";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = Router();

// Middleware to check if Social Media or Admin
const socialOrAdmin = async (req: any, res: any, next: any) => {
  if (req.user.role === "ADMIN") return next();
  
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.userId) },
    include: { department: true }
  });

  if (user?.department?.name.toLowerCase().includes("social") || user?.department?.name.toLowerCase().includes("media")) {
    return next();
  }

  res.status(403).json({ message: "Access denied. Social Media or Admin privileges required." });
};

router.use(authMiddleware, socialOrAdmin);

// Content Calendar
router.get("/content", async (req, res) => {
  try {
    const content = await (prisma as any).socialContent.findMany({
      orderBy: { scheduledDate: "asc" }
    });
    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/content", async (req, res) => {
  try {
    const { title, platform, scheduledDate, status, caption, assetUrl } = req.body;
    const item = await (prisma as any).socialContent.create({
      data: { 
        title, 
        platform, 
        scheduledDate: new Date(scheduledDate), 
        status, 
        caption, 
        assetUrl 
      }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/content/:id", async (req, res) => {
  try {
    const { status, engagement } = req.body;
    const item = await (prisma as any).socialContent.update({
      where: { id: Number(req.params.id) },
      data: { status, engagement: engagement ? Number(engagement) : undefined }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Campaigns
router.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await (prisma as any).mediaCampaign.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ campaigns });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/campaigns", async (req, res) => {
  try {
    const { title, description, startDate, endDate, status, platform, reachGoal, color } = req.body;
    const campaign = await (prisma as any).mediaCampaign.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        platform,
        reachGoal,
        color: color || "#ec4899"
      }
    });
    res.json(campaign);
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Creative Assets
router.get("/assets", async (req, res) => {
  try {
    const assets = await (prisma as any).mediaAsset.findMany({
      where: { category: "SOCIAL_MEDIA" },
      orderBy: { createdAt: "desc" }
    });
    res.json({ assets });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/assets", upload.single("file"), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const asset = await (prisma as any).mediaAsset.create({
      data: {
        url: `/uploads/social/assets/${req.file.filename}`,
        fileName: req.file.originalname,
        fileType: path.extname(req.file.originalname).toUpperCase().replace(".", ""),
        category: "SOCIAL_MEDIA",
        uploadedBy: req.user.userId ? Number(req.user.userId) : null
      }
    });
    res.json(asset);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
