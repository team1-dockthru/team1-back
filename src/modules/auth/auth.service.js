import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ENV } from "../../config/env.js";
import { OAuth2Client } from "google-auth-library";

console.log("GOOGLE_CLIENT_ID =", ENV.GOOGLE_CLIENT_ID);

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

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

  if (!user.password) {
    const err = new Error(
      "소셜 로그인으로 가입된 계정입니다. Google 로그인을 사용해주세요."
    );
    err.status = 400;
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


async function googleLogin({ idToken }) {
  if (!idToken) {
    const err = new Error("idToken이 필요합니다.");
    err.status = 400;
    throw err;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: ENV.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const provider = "google";
  const providerId = payload?.sub;
  const email = payload?.email;
  const emailVerified = payload?.email_verified;
  const name = payload?.name;

  if (!providerId) {
    const err = new Error("유효하지 않은 Google 토큰입니다.");
    err.status = 401;
    throw err;
  }

  if (!email || emailVerified !== true) {
    const err = new Error("Google 이메일 인증이 필요합니다.");
    err.status = 401;
    throw err;
  }

  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerId: { provider, providerId },
    },
    include: { user: true },
  });

  let user;

  if (existingAccount?.user) {
    user = existingAccount.user;
  } else {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      user = existingUser;

      await prisma.oAuthAccount.create({
        data: {
          provider,
          providerId,
          email,
          userId: user.id,
        },
      });
    } else {
      const nickname = name && name.trim() ? name.trim() : email.split("@")[0];

      user = await prisma.user.create({
        data: {
          email,
          password: null,
          nickname,
          profileImage: 0,
          oauthAccounts: {
            create: [{ provider, providerId, email }],
          },
        },
      });
    }
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
  googleLogin,
};
