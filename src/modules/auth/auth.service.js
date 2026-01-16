import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ENV } from "../../config/env.js";
import { OAuth2Client } from "google-auth-library";
import authRepository from "./auth.repository.js";

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

// 회원가입: 이메일 중복 체크 → 비밀번호 해싱 → 유저 생성 → JWT 토큰 발급
export async function signup({ email, password, nickname, profileImage }) {
  const existing = await authRepository.findUserByEmail(email);
  if (existing) {
    const err = new Error("이미 사용 중인 이메일입니다.");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser({
    email,
    password: hashedPassword,
    nickname,
    profileImage: profileImage ?? "USER",
    grade: "NORMAL",
  });

  // 회원가입 시 tokenVersion은 기본값 0
  const token = jwt.sign(
    { userId: user.id, type: "user", role: user.role || "USER", tokenVersion: 0 },
    ENV.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { user, token };
}

// 로그인: 이메일 조회 → 비밀번호 검증 → JWT 토큰 발급
export async function login({ email, password }) {
  const user = await authRepository.findUserByEmail(email);

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

  // 토큰 버전 증가 (이전 토큰 무효화)
  const updated = await authRepository.incrementTokenVersion(user.id);

  const token = jwt.sign(
    { userId: user.id, type: "user", role: user.role || "USER", tokenVersion: updated.tokenVersion },
    ENV.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      role: user.role,
      grade: user.grade,
    },
    token,
  };
}

// Google 소셜 로그인: idToken 검증 → OAuth 계정 조회/생성 → 유저 조회/생성 → JWT 토큰 발급
export async function googleLogin({ idToken }) {
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

  const existingAccount = await authRepository.findOAuthAccount(provider, providerId);

  let user;

  if (existingAccount?.user) {
    user = existingAccount.user;
  } else {
    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
      user = existingUser;

      await authRepository.createOAuthAccount({
        provider,
        providerId,
        email,
        userId: user.id,
      });
    } else {
      const nickname = name && name.trim() ? name.trim() : email.split("@")[0];

      user = await authRepository.createUser({
        email,
        password: null,
        nickname,
        profileImage: "USER",
        role: "USER",
        grade: "NORMAL",
        oauthAccounts: {
          create: [{ provider, providerId, email }],
        },
      });
    }
  }

  // 토큰 버전 증가 (이전 토큰 무효화)
  const updated = await authRepository.incrementTokenVersion(user.id);

  const token = jwt.sign(
    { userId: user.id, type: "user", role: user.role || "USER", tokenVersion: updated.tokenVersion },
    ENV.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      role: user.role,
      grade: user.grade,
    },
    token,
  };
}

export async function findUserById(userId) {
  return authRepository.findUserById(userId);
}

// 유저 통계 조회: User 모델에 저장된 통계 필드 반환
export async function getUserStatistics(userId) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    return { challengeParticipations: 0, recommendedCount: 0 };
  }
  return {
    challengeParticipations: user.challengeParticipations,
    recommendedCount: user.recommendedCount,
  };
}

// 유저 등급 업데이트: 통계 필드 기반으로 등급 계산
// 조건: (참여 5회 + 추천 5회) 또는 참여 10회 또는 추천 10회 → EXPERT, 그 외 → NORMAL
export async function updateUserGrade(userId) {
  const user = await authRepository.findUserById(userId);
  if (!user) return null;

  const { challengeParticipations, recommendedCount } = user;

  let newGrade = "NORMAL";

  if (
    (challengeParticipations >= 5 && recommendedCount >= 5) ||
    challengeParticipations >= 10 ||
    recommendedCount >= 10
  ) {
    newGrade = "EXPERT";
  }

  const updatedUser = await authRepository.updateUserGrade(userId, newGrade);
  return updatedUser;
}

export default {
  signup,
  login,
  googleLogin,
  findUserById,
  getUserStatistics,
  updateUserGrade,
};
