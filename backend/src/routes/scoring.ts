import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getMyScore, getLeaderboardRoute, getMyBadges } from "../controllers/scoringController";

const router = Router();
router.use(authMiddleware);

router.get("/me", getMyScore);
router.get("/leaderboard", getLeaderboardRoute);
router.get("/badges", getMyBadges);

export default router;
