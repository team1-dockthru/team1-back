import express from "express";
import { login } from "./auth.controller.js";
import { validateLogin } from "./auth.validator.js";
import { authLimiter } from "../../middlewares/security.middleware.js";

const router = express.Router();

router.post("/login", authLimiter, validateLogin, login);

export default router;