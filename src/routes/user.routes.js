import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// 모든 사용자 라우트는 인증 필요
router.use(authenticateToken);

// 현재 사용자 정보 조회
router.get("/me", async (req, res, next) => {
  try {
    // TODO: 현재 사용자 정보 조회 로직 구현
    res.json({
      message: "현재 사용자 정보",
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// 사용자 정보 수정
router.put("/me", async (req, res, next) => {
  try {
    // TODO: 사용자 정보 수정 로직 구현
    res.json({ message: "사용자 정보 수정 엔드포인트" });
  } catch (error) {
    next(error);
  }
});

// 사용자 삭제
router.delete("/me", async (req, res, next) => {
  try {
    // TODO: 사용자 삭제 로직 구현
    res.json({ message: "사용자 삭제 엔드포인트" });
  } catch (error) {
    next(error);
  }
});

export default router;
