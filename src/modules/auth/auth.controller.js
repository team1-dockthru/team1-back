import authService from "./auth.service.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}