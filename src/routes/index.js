import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import workRoutes from "../modules/work/work.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "API root",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      works: "/works",
    },
  });
});

router.use("/auth", authRoutes);
router.use("/works", workRoutes);

export default router;
