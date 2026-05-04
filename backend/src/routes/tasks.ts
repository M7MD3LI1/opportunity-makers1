import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { upload } from "../middleware/upload";
import { getTasks, createTask, submitTask, deleteTask, gradeSubmission, deleteSubmission } from "../controllers/taskController";

const router = Router();

router.use(authMiddleware);

router.get("/", getTasks);
router.post("/", adminMiddleware, createTask);
router.delete("/:id", adminMiddleware, deleteTask);
router.post("/:taskId/submit", upload.single("file"), submitTask);
router.delete("/submissions/:submissionId", deleteSubmission);
router.post("/submissions/:submissionId/grade", adminMiddleware, gradeSubmission);

export default router;
