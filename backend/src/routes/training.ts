import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../config/db";

const router = Router();

// Middleware to check if Training or Admin
const trainingOrAdmin = async (req: any, res: any, next: any) => {
  if (req.user.role === "ADMIN") return next();
  
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.userId) },
    include: { department: true }
  });

  if (user?.department?.name.toLowerCase().includes("training") || user?.department?.name.toLowerCase().includes("dev")) {
    return next();
  }

  res.status(403).json({ message: "Access denied. Training or Admin privileges required." });
};

router.use(authMiddleware, trainingOrAdmin);

// Courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await (prisma as any).course.findMany({
      include: { 
        lessons: true,
        quizzes: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/courses", async (req, res) => {
  try {
    const { title, description, thumbnail, category, isPublished } = req.body;
    const course = await (prisma as any).course.create({
      data: { title, description, thumbnail, category, isPublished: Boolean(isPublished) }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Lessons
router.post("/lessons", async (req, res) => {
  try {
    const { courseId, title, content, videoUrl, order } = req.body;
    const lesson = await (prisma as any).lesson.create({
      data: { 
        courseId: Number(courseId), 
        title, 
        content, 
        videoUrl, 
        order: Number(order) || 0 
      }
    });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Quizzes
router.get("/quizzes", async (req, res) => {
  try {
    const quizzes = await (prisma as any).quiz.findMany({
      include: { 
        course: true,
        questions: true 
      }
    });
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
