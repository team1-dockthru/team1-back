import prisma from "../../config/database.js";

const DEFAULT_PAGE_SIZE = 3;

export async function createFeedback({ userId, workId, content }) {
  // 사용자 피드백 생성.
  return prisma.feedback.create({
    data: {
      userId,
      workId,
      content,
    },
  });
}

export async function getFeedbackById(id) {
  return prisma.feedback.findUnique({
    where: { id },
  });
}

export async function listFeedbacks({ workId, userId, page = 1, limit = DEFAULT_PAGE_SIZE }) {
  const where = {};

  if (typeof workId === "number") where.workId = workId;
  if (typeof userId === "number") where.userId = userId;

  // 피드백 목록 오프셋 페이지네이션.
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feedback.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function updateFeedback({ id, userId, data }) {
  // 수정 전 존재/소유권 확인.
  const existing = await prisma.feedback.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("피드백을 찾을 수 없습니다."), { status: 404 });
  }
  if (existing.userId !== userId) {
    throw Object.assign(new Error("수정 권한이 없습니다."), { status: 403 });
  }

  return prisma.feedback.update({
    where: { id },
    data,
  });
}

export async function deleteFeedback({ id, userId }) {
  // 삭제 전 존재/소유권 확인.
  const existing = await prisma.feedback.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("피드백을 찾을 수 없습니다."), { status: 404 });
  }
  if (existing.userId !== userId) {
    throw Object.assign(new Error("삭제 권한이 없습니다."), { status: 403 });
  }

  return prisma.feedback.delete({ where: { id } });
}
