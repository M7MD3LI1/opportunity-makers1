import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../config/db";

const router = Router();

// Middleware to check if OR or Admin
const orOrAdmin = async (req: any, res: any, next: any) => {
  if (req.user.role === "ADMIN") return next();
  
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.userId) },
    include: { department: true }
  });

  if (user?.department?.name.toLowerCase().includes("or") || user?.department?.name.toLowerCase().includes("operation")) {
    return next();
  }

  res.status(403).json({ message: "Access denied. OR or Admin privileges required." });
};

router.use(authMiddleware, orOrAdmin);

// Events
router.get("/events", async (req, res) => {
  try {
    const events = await (prisma as any).event.findMany({
      include: { 
        tasks: true,
        inventory: true,
        budgetRecords: true,
        department: true
      },
      orderBy: { startDate: "desc" }
    });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, status, budget, departmentId } = req.body;
    const event = await (prisma as any).event.create({
      data: { 
        title, 
        description, 
        location, 
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
        budget: Number(budget) || 0,
        departmentId: departmentId ? Number(departmentId) : null
      }
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Inventory
router.get("/inventory", async (req, res) => {
  try {
    const items = await (prisma as any).inventoryItem.findMany({
      include: { event: true },
      orderBy: { name: "asc" }
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const { name, category, quantity, status, eventId } = req.body;
    const item = await (prisma as any).inventoryItem.create({
      data: { 
        name, 
        category, 
        quantity: Number(quantity) || 1, 
        status, 
        eventId: eventId ? Number(eventId) : null 
      }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Budget
router.get("/budget", async (req, res) => {
  try {
    const records = await (prisma as any).budgetRecord.findMany({
      include: { event: true },
      orderBy: { date: "desc" }
    });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
