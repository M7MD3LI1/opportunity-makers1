import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { getEvaluations, updateEvaluation, updateVpiEvaluation, getMyEvaluations } from "../controllers/evaluationController";

const router = Router();

router.use(authMiddleware);
router.get("/me", getMyEvaluations);
router.get("/", adminMiddleware, getEvaluations);
router.post("/update", adminMiddleware, updateEvaluation);
router.post("/update-vpi", adminMiddleware, updateVpiEvaluation);

export default router;
