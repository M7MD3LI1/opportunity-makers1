import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getInsights, chatMessage, publicChat } from "../controllers/aiController";

const router = Router();

// Public routes
router.post("/public-chat", publicChat);

// Protected routes
router.use(authMiddleware);
router.get("/insights", getInsights);
router.post("/chat", chatMessage);

export default router;
