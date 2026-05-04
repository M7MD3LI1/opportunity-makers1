import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { requestDocument, getMyDocuments, getPendingDocuments, generateDocument } from "../controllers/documentsController";

const router = Router();

router.use(authMiddleware);

router.post("/request", requestDocument);
router.get("/me", getMyDocuments);
router.get("/pending", adminMiddleware, getPendingDocuments);
router.put("/:id/generate", adminMiddleware, generateDocument);

export default router;
