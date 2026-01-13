import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ENV } from "../../config/env.js";

async function signup({ email, password, nickname, profileImage }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("이미 사용 중인 이메일입니다.");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      nickname,
      profileImage: Number(profileImage ?? 0),
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      profileImage: true,
      createdAt: true,
    },
  });

  const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { user, token };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
    },
    token,
  };
}

export default {
  signup,
  login,
};
