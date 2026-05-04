import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { upload } from "../middleware/upload";
import {
  getPendingUsers,
  getApprovedUsers,
  getRejectedUsers,
  approveUser,
  rejectUser,
  uploadImage,
  getImages,
  deleteImage,
  revokeUser,
  getKpiDashboard,
  getAnalytics,
  getActivityLogs,
  getUserFullProfile,
  getExecutiveStats,
} from "../controllers/adminController";
import { createDepartment, updateDepartment, deleteDepartment } from "../controllers/departmentController";
import { updateMeeting } from "../controllers/meetingController";

const router = Router();
router.use(authMiddleware, adminMiddleware);

// User management
router.get("/users/pending", getPendingUsers);
router.get("/users/approved", getApprovedUsers);
router.get("/users/rejected", getRejectedUsers);
router.get("/users/:id/full", getUserFullProfile);
router.put("/users/:id/approve", approveUser);
router.put("/users/:id/reject", rejectUser);
router.delete("/users/:id/revoke", revokeUser);

// Analytics & KPIs
router.get("/kpi", getKpiDashboard);
router.get("/analytics", getAnalytics);
router.get("/logs", getActivityLogs);
router.get("/executive-stats", getExecutiveStats);

// Images
router.post("/images/upload", upload.single("image"), uploadImage);
router.get("/images", getImages);
router.delete("/images/:id", deleteImage);

// Departments
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Meetings
router.put("/meeting", updateMeeting);

export default router;
