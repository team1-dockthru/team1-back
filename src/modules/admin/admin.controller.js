import { adminSignup as adminSignupService, adminLogin as adminLoginService } from "./admin.service.js";

export async function adminSignup(req, res, next) {
  try {
    const { email, password, nickname } = req.body;

    const result = await adminSignupService({
      email,
      password,
      nickname,
    });

    return res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await adminLoginService({ email, password });
    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function adminLogout(req, res, next) {
  try {
    // JWT는 stateless이므로 서버 측에서 특별한 처리가 필요 없음
    // 클라이언트에서 토큰을 삭제하면 됨
    return res.status(200).json({ message: "로그아웃되었습니다." });
  } catch (err) {
    next(err);
  }
}
