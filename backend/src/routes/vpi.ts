import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { getMyVpiDashboard, getVpiLeaderboard } from "../controllers/vpiController";

const router = Router();

router.use(authMiddleware);

router.get("/me", getMyVpiDashboard);
router.get("/leaderboard", adminMiddleware, getVpiLeaderboard);

export default router;
