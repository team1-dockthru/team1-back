export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  // Email 검증
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "이메일은 필수입니다." });
  }

  // Email 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "올바른 이메일 형식이 아닙니다." });
  }

  // Password 검증
  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "비밀번호는 필수입니다." });
  }

  // Password 최소 길이 검증
  if (password.length < 6) {
    return res.status(400).json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
  }

  next();
}
