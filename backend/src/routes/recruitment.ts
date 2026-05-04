import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { applyRecruitment, getMyApplication, getAllApplications, updateApplicationStage } from "../controllers/recruitmentController";

const router = Router();

router.use(authMiddleware);

router.post("/apply", applyRecruitment);
router.get("/me", getMyApplication);
router.get("/all", adminMiddleware, getAllApplications);
router.put("/:id", adminMiddleware, updateApplicationStage);

export default router;
