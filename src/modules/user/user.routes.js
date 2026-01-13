import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { getMe } from "./user.controller.js";

const router = Router();

router.get("/me", authenticateToken, getMe);

export default router;
