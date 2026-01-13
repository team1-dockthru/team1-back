import  authService  from "./auth.service.js";

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
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
