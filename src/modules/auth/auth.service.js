import bcrypt from "bcrypt";
import prisma from "../../config/database.js";
import { generateToken } from "../../utils/jwt.js";
import { ENV } from "../../config/env.js";

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw Object.assign(new Error("이메일 또는 비밀번호가 올바르지 않습니다."), {
      status: 401,
    });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw Object.assign(new Error("이메일 또는 비밀번호가 올바르지 않습니다."), {
      status: 401,
    });
  }

  const accessToken = generateToken(
    {
      userId: user.id,
    },
    process.env.JWT_EXPIRES_IN || "1d"
  );

  return {
    accessToken,
    user: {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

export default { login };
