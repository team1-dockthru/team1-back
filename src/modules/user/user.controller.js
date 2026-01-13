import { findUserById } from "./user.service.js";

export async function getMe(req, res) {
  const { userId } = req.user;

  const user = await findUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
  }
  return res.status(200).json({ user });
}
