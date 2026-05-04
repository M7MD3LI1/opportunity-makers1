import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { signup, login, changePassword, getMe } from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/change-password", authMiddleware, changePassword);
router.get("/me", authMiddleware, getMe);

export default router;
