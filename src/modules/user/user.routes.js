import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { signup, login, googleLogin, logout, getMe } from "./user.controller.js";
import { validateLogin, validateSignup } from "./user.validator.js";
import { authLimiter } from "../../middlewares/security.middleware.js";

const router = Router();

// 인증 관련 라우트
router.post("/signup", authLimiter, validateSignup, signup);
router.post("/login", authLimiter, validateLogin, login);
router.post("/google", googleLogin);
router.post("/logout", authenticateToken, logout);

// 사용자 정보 조회 (인증 필요)
router.get("/me", authenticateToken, getMe);

export default router;
