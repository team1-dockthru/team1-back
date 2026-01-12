import { Router } from "express";
import { authLimiter } from "../middlewares/security.middleware.js";

const router = Router();

// 인증 관련 라우트는 rate limiting 적용
router.use(authLimiter);

// 회원가입
router.post("/register", async (req, res, next) => {
  try {
    // TODO: 회원가입 로직 구현
    res.status(201).json({ message: "회원가입 엔드포인트" });
  } catch (error) {
    next(error);
  }
});

// 로그인
router.post("/login", async (req, res, next) => {
  try {
    // TODO: 로그인 로직 구현
    res.json({ message: "로그인 엔드포인트" });
  } catch (error) {
    next(error);
  }
});

// 토큰 갱신
router.post("/refresh", async (req, res, next) => {
  try {
    // TODO: 토큰 갱신 로직 구현
    res.json({ message: "토큰 갱신 엔드포인트" });
  } catch (error) {
    next(error);
  }
});

export default router;
