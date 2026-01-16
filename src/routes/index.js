import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "API root",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
    },
  });
});

router.use("/auth", authRoutes);

export default router;
