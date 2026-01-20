import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import healthRouter from "./modules/health/health.routes.js";
import workRoutes from "./modules/work/work.routes.js";
import challengeRoutes from "./modules/challenges/challenges.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import { securityHeaders, apiLimiter } from "./middlewares/security.middleware.js";
import { swaggerSetup } from "./config/swagger.js";

const app = express();

app.set("trust proxy", true);
app.use(securityHeaders);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

swaggerSetup(app);

app.use("/health", healthRouter);

// auth (rate limit 적용)
app.use("/auth", apiLimiter);
app.use("/auth", authRoutes);

// routes
app.use("/works", workRoutes);
app.use("/challenges", challengeRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "요청한 리소스를 찾을 수 없습니다." });
});

app.use(errorMiddleware);

export default app;