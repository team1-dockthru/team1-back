import express from "express";
import cors from "cors";

import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { securityHeaders, apiLimiter } from "./middlewares/security.middleware.js";

const app = express();

// 보안 헤더 설정
app.use(securityHeaders);

// CORS 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting (인증 라우트는 제외)
app.use("/api", apiLimiter);

// 라우트
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ message: "요청한 리소스를 찾을 수 없습니다." });
});

// 에러 핸들러 (가장 마지막에 위치)
app.use(errorMiddleware);

export default app;
