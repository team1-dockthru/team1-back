import { prisma } from "../../config/prisma.js";

// Repository 레이어: 데이터베이스 쿼리 로직 분리

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      email: true,
      nickname: true,
      profileImage: true,
      role: true,
      grade: true,
      challengeParticipations: true,
      recommendedCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createUser(data) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      nickname: true,
      profileImage: true,
      role: true,
      grade: true,
      challengeParticipations: true,
      recommendedCount: true,
      createdAt: true,
    },
  });
}

export async function updateUserGrade(userId, grade) {
  return prisma.user.update({
    where: { id: userId },
    data: { grade },
    select: {
      id: true,
      email: true,
      nickname: true,
      profileImage: true,
      role: true,
      grade: true,
      challengeParticipations: true,
      recommendedCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findOAuthAccount(provider, providerId) {
  return prisma.oAuthAccount.findUnique({
    where: {
      provider_providerId: { provider, providerId },
    },
    include: { user: true },
  });
}

export async function createOAuthAccount(data) {
  return prisma.oAuthAccount.create({
    data,
  });
}

// 토큰 버전 증가 (로그인 시 이전 토큰 무효화)
export async function incrementTokenVersion(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      tokenVersion: {
        increment: 1,
      },
    },
    select: {
      id: true,
      tokenVersion: true,
    },
  });
}

// 유저의 tokenVersion 조회
export async function getUserTokenVersion(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokenVersion: true,
    },
  });
  return user?.tokenVersion ?? 0;
}

export default {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserGrade,
  findOAuthAccount,
  createOAuthAccount,
  incrementTokenVersion,
  getUserTokenVersion,
};
