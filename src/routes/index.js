import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// API 루트
router.get("/", (req, res) => {
  res.json({
    message: "API root",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
    },
  });
});

// 라우트 등록
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
