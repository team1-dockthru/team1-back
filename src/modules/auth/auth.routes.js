import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { signup, login, googleLogin, logout, getMe } from "./auth.controller.js";
import { validateLogin, validateSignup } from "./auth.validator.js";
import { authLimiter } from "../../middlewares/security.middleware.js";

const router = Router();

router.post("/signup", authLimiter, validateSignup, signup);
router.post("/login", authLimiter, validateLogin, login);
router.post("/google", googleLogin);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getMe);

export default router;
