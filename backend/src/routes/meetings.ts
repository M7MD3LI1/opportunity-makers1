import { Router } from "express";
import { getNextMeeting } from "../controllers/meetingController";

const router = Router();

router.get("/next", getNextMeeting);

export default router;
