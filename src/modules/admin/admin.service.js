import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ENV } from "../../config/env.js";

export async function adminSignup({ email, password, nickname }) {
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("이미 사용 중인 이메일입니다.");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      nickname,
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      createdAt: true,
    },
  });

  const token = jwt.sign({ adminId: admin.id, type: "admin" }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { admin, token };
}

export async function adminLogin({ email, password }) {
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) {
    const err = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    err.status = 401;
    throw err;
  }

  if (!admin.password) {
    const err = new Error("비밀번호가 설정되지 않은 관리자 계정입니다.");
    err.status = 400;
    throw err;
  }

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) {
    const err = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign({ adminId: admin.id, type: "admin" }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      nickname: admin.nickname,
    },
    token,
  };
}

export default {
  adminSignup,
  adminLogin,
};
