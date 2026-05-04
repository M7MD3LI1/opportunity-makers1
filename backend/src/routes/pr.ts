import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../config/db";

const router = Router();

// Middleware to check if PR or Admin
const prOrAdmin = async (req: any, res: any, next: any) => {
  if (req.user.role === "ADMIN") return next();
  
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.userId) },
    include: { department: true }
  });

  if (user?.department?.name.toLowerCase().includes("pr")) {
    return next();
  }

  res.status(403).json({ message: "Access denied. PR or Admin privileges required." });
};

router.use(authMiddleware, prOrAdmin);

// Partners
router.get("/partners", async (req, res) => {
  try {
    const partners = await (prisma as any).partner.findMany({
      include: { sponsorships: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ partners });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/partners", async (req, res) => {
  try {
    const { name, type, contactName, email, phone, tier, status } = req.body;
    const partner = await (prisma as any).partner.create({
      data: { name, type, contactName, email, phone, tier, status }
    });
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sponsorships
router.get("/sponsorships", async (req, res) => {
  try {
    const sponsorships = await (prisma as any).sponsorship.findMany({
      include: { partner: true },
      orderBy: { date: "desc" }
    });
    res.json({ sponsorships });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/sponsorships", async (req, res) => {
  try {
    const { partnerId, amount, type, status, notes, date } = req.body;
    const sponsorship = await (prisma as any).sponsorship.create({
      data: { 
        partnerId: Number(partnerId), 
        amount: Number(amount), 
        type, 
        status, 
        notes,
        date: date ? new Date(date) : new Date()
      }
    });
    res.json(sponsorship);
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
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
