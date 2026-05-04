import { Router } from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/auth";
import { updateProfile, updateProfilePicture, updatePassword } from "../controllers/userController";

const router = Router();
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (_req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.put("/profile", updateProfile);
router.put("/profile-picture", upload.single("avatar"), updateProfilePicture);
router.put("/password", updatePassword);

export default router;
