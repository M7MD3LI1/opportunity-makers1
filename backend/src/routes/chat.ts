import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getMessages, sendMessage, getChatStatus, toggleChatStatus } from "../controllers/chatController";

const router = Router();

router.use(authMiddleware);

router.get("/status", getChatStatus);
router.post("/status", toggleChatStatus);
router.get("/:departmentId?", getMessages);
router.post("/:departmentId?", sendMessage);

export default router;
