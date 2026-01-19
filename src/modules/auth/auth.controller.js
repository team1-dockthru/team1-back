import authService from "./auth.service.js";

export async function signup(req, res, next) {
  try {
    const { email, password, nickname, profileImage } = req.body;

    const result = await authService.signup({
      email,
      password,
      nickname,
      profileImage,
    });

    return res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    const result = await authService.googleLogin({ idToken });
    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    return res.status(200).json({ data: { message: "로그아웃되었습니다." } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "인증 정보가 올바르지 않습니다." });
    }

    const user = await authService.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json({ data: { user } });
  } catch (err) {
    next(err);
  }
}
