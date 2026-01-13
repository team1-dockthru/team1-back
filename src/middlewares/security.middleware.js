import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Helmet 보안 헤더 설정
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// 일반 API Rate Limiting
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증 관련 엄격한 Rate Limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5 요청
  message: "너무 많은 인증 시도가 발생했습니다. 잠시 후 다시 시도해주세요.",
  standardHeaders: true,
  legacyHeaders: false,
});
