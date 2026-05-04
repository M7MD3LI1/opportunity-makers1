import { Router } from "express";
import { getDepartments } from "../controllers/departmentController";

const router = Router();

// Public route - no auth required
router.get("/", getDepartments);

export default router;
