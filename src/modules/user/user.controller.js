import userService from "./user.service.js";

// 인증 관련 컨트롤러
export async function signup(req, res, next) {
  try {
    const { email, password, nickname, profileImage } = req.body;

    const result = await userService.signup({
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
    const result = await userService.login({ email, password });
    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    const result = await userService.googleLogin({ idToken });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    // JWT는 stateless이므로 서버 측에서 특별한 처리가 필요 없음
    // 클라이언트에서 토큰을 삭제하면 됨
    return res.status(200).json({ message: "로그아웃되었습니다." });
  } catch (err) {
    next(err);
  }
}

// 사용자 정보 조회
export async function getMe(req, res, next) {
  try {
    const { userId } = req.user;

    const user = await userService.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
