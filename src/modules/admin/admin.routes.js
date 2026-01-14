import express from "express";
import { adminSignup, adminLogin, adminLogout } from "./admin.controller.js";
import { validateLogin, validateSignup } from "./admin.validator.js";
import { authLimiter } from "../../middlewares/security.middleware.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", authLimiter, validateSignup, adminSignup);
router.post("/login", authLimiter, validateLogin, adminLogin);
router.post("/logout", authenticateToken, adminLogout);

export default router;
