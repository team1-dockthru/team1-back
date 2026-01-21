import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "./user.routes.js";
import workRoutes from "../modules/work/work.routes.js";
import challengeRoutes from "../modules/challenges/challenges.routes.js";
import notificationRoutes from "../modules/notification/notification.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "API root",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      works: "/api/works",
      challenges: "/api/challenges",
      notifications: "/api/notifications",
    },
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/works", workRoutes);
router.use("/challenges", challengeRoutes);
router.use("/notifications", notificationRoutes);

export default router;