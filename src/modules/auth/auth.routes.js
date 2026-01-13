import express from "express";
import { login, signup } from "./auth.controller.js";
import { validateLogin } from "./auth.validator.js";
import { authLimiter } from "../../middlewares/security.middleware.js";

const router = express.Router();

router.post("/signup", authLimiter, validateLogin, signup);
router.post("/login", authLimiter, validateLogin, login);

export default router;
