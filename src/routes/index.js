import { Router } from "express";
import userRoutes from "../modules/user/user.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";

const router = Router();

// API 루트
router.get("/", (req, res) => {
  res.json({
    message: "API root",
    version: "1.0.0",
    endpoints: {
      user: "/api/user",
      admin: "/api/admin",
    },
  });
});

// 라우트 등록
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

export default router;
