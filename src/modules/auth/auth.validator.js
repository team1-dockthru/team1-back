// 회원가입 검증: 필수 필드, 이메일 형식, 비밀번호 길이, profileImage enum
export function validateSignup(req, res, next) {
  const { email, password, nickname, profileImage } = req.body;

  if (!email || !password || !nickname) {
    return res
      .status(400)
      .json({ message: "이메일, 비밀번호, 닉네임은 필수입니다." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "올바른 이메일 형식이 아닙니다." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "비밀번호는 최소 6자 이상이어야합니다." });
  }

  if (profileImage && !["ADMIN", "USER"].includes(profileImage)) {
    return res
      .status(400)
      .json({ message: "profileImage는 ADMIN 또는 USER만 가능합니다." });
  }

  next();
}

// 로그인 검증: 이메일 형식, 비밀번호 필수 및 길이
export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "이메일은 필수입니다." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "올바른 이메일 형식이 아닙니다." });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "비밀번호는 필수입니다." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
  }

  next();
}
