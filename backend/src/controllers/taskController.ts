import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { updateUserScore, addScoreLog } from "../services/scoringEngine";
import { checkAndAwardBadges } from "../services/gamificationEngine";
import { calculateVpi } from "../services/vpiEngine";

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    if (!user) { res.status(404).json({ message: "المستخدم غير موجود" }); return; }

    let tasks;
    if (user.role === "ADMIN") {
      tasks = await prisma.task.findMany({
        include: { department: true, submissions: { include: { user: { select: { id: true, name: true, email: true } } } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { OR: [{ departmentId: null }, { departmentId: user.departmentId }] },
        include: { submissions: { where: { userId: user.id } } },
        orderBy: { createdAt: "desc" },
      });
    }

    res.json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, departmentId, deadline, points } = req.body;

    if (!title) { res.status(400).json({ message: "عنوان المهمة مطلوب" }); return; }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        departmentId: departmentId ? Number(departmentId) : null,
        deadline: deadline ? new Date(deadline) : null,
        points: points ? Number(points) : 10,
        estimatedHours: req.body.estimatedHours ? Number(req.body.estimatedHours) : 2,
      },
    });

    // Create notifications for users
    const targetUsers = await prisma.user.findMany({
      where: {
        status: "APPROVED",
        ...(departmentId ? { departmentId: Number(departmentId) } : {})
      },
      select: { id: true }
    });

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map(u => ({
          userId: u.id,
          title: "🆕 مهمة جديدة",
          message: `تمت إضافة مهمة جديدة: ${title}`,
          type: "INFO"
        }))
      });
    }

    res.status(201).json({ message: "تم إنشاء المهمة بنجاح", task });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const submitTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { notes } = req.body;
    const userId = req.user!.userId;

    if (!req.file) { res.status(400).json({ message: "ملف المهمة مطلوب" }); return; }

    const task = await prisma.task.findUnique({ where: { id: Number(taskId) } });
    if (!task) { res.status(404).json({ message: "المهمة غير موجودة" }); return; }

    // Check if on time
    const isOnTime = !task.deadline || new Date() <= new Date(task.deadline);

    const existingSubmission = await prisma.taskSubmission.findUnique({
      where: { taskId_userId: { taskId: Number(taskId), userId: Number(userId) } },
    });

    let submission;
    if (existingSubmission) {
      submission = await prisma.taskSubmission.update({
        where: { id: existingSubmission.id },
        data: { fileUrl: `/uploads/${req.file.filename}`, notes, isOnTime },
      });
    } else {
      submission = await prisma.taskSubmission.create({
        data: {
          taskId: Number(taskId),
          userId: Number(userId),
          fileUrl: `/uploads/${req.file.filename}`,
          notes,
          isOnTime,
        },
      });

      // Award points
      const pts = isOnTime ? task.points : Math.floor(task.points * 0.5);
      await addScoreLog(Number(userId), pts, `إنجاز مهمة: ${task.title}`, "task");

      // Bonus points for submission (user request)
      await addScoreLog(Number(userId), 10, `مكافأة تسليم مهمة: ${task.title}`, "bonus");

      // Create notification
      await prisma.notification.create({
        data: {
          userId: Number(userId),
          title: isOnTime ? "✅ تم تسليم المهمة في الوقت" : "⚠️ تم تسليم المهمة بعد الموعد",
          message: `تم تسليم "${task.title}" ${isOnTime ? "في الوقت المحدد 🎉" : "بعد الموعد النهائي"}`,
          type: isOnTime ? "SUCCESS" : "WARNING",
        },
      });
    }

    // Update score & check badges
    await updateUserScore(Number(userId));
    await checkAndAwardBadges(Number(userId));

    res.status(200).json({ message: "تم تسليم المهمة بنجاح", submission, isOnTime });
  } catch (error) {
    console.error("Submit task error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.taskSubmission.deleteMany({ where: { taskId: Number(id) } });
    await prisma.task.delete({ where: { id: Number(id) } });
    res.json({ message: "تم حذف المهمة بنجاح" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { letterGrade } = req.body; // 'A', 'B', 'C', 'D', 'F'

    const grades: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };
    const gradeValue = grades[letterGrade?.toUpperCase()];

    if (gradeValue === undefined) {
      res.status(400).json({ message: "تقييم غير صالح. يجب أن يكون A, B, C, D أو F." });
      return;
    }

    const submission = await prisma.taskSubmission.findUnique({ 
      where: { id: Number(submissionId) },
      include: { task: true } 
    });

    if (!submission) {
      res.status(404).json({ message: "التسليم غير موجود" });
      return;
    }

    const updated = await prisma.taskSubmission.update({
      where: { id: Number(submissionId) },
      data: { 
        letterGrade: letterGrade.toUpperCase(), 
        gradeValue,
        approvedHours: submission.task.estimatedHours // award hours based on task estimate
      }
    });

    // Also create or update volunteer hour record
    const month = new Date(submission.createdAt).toISOString().slice(0, 7);
    
    // Check if hour record exists
    const existingHour = await prisma.volunteerHour.findFirst({
      where: { taskSubmissionId: updated.id }
    });

    if (existingHour) {
      await prisma.volunteerHour.update({
        where: { id: existingHour.id },
        data: { hours: submission.task.estimatedHours, isApproved: true }
      });
    } else {
      await prisma.volunteerHour.create({
        data: {
          userId: submission.userId,
          month,
          hours: submission.task.estimatedHours,
          description: `إنجاز مهمة: ${submission.task.title}`,
          category: "task",
          isApproved: true,
          taskSubmissionId: updated.id
        }
      });
    }

    // Trigger VPI recalculation
    await calculateVpi(submission.userId, month);

    res.json({ message: "تم تقييم المهمة وتحديث VPI بنجاح", submission: updated });
  } catch (error) {
    console.error("Grade submission error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};

export const deleteSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const userId = req.user!.userId;

    const submission = await prisma.taskSubmission.findUnique({
      where: { id: Number(submissionId) },
    });

    if (!submission) { res.status(404).json({ message: "التسليم غير موجود" }); return; }
    if (submission.userId !== Number(userId)) { res.status(403).json({ message: "غير مسموح لك بحذف هذا التسليم" }); return; }

    if (submission.letterGrade) {
      res.status(400).json({ message: "لا يمكن حذف تسليم تم تقييمه بالفعل" });
      return;
    }

    await prisma.taskSubmission.delete({ where: { id: Number(submissionId) } });
    res.json({ message: "تم حذف التسليم بنجاح" });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({ message: "خطأ داخلي في الخادم" });
  }
};
