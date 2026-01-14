import express from "express";
import cors from "cors";

import routes from "./routes/index.js";
import userRouter from "./modules/user/user.routes.js";
import healthRouter from "./modules/health/health.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import {
  securityHeaders,
  apiLimiter,
} from "./middlewares/security.middleware.js";

const app = express();

// 보안/기본 미들웨어
app.use(securityHeaders);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health
app.use("/health", healthRouter);

// Rate limiting (API에만)
app.use("/api", apiLimiter);

// 라우트
app.use("/api", routes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "요청한 리소스를 찾을 수 없습니다." });
});

// 에러
app.use(errorMiddleware);

export default app;
