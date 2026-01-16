import prisma from "../../config/database.js";

const WORK_STATUS = {
  draft: "draft",
  done: "done",
};

export async function createWork({ userId, challengeId, title, content, originalUrl }) {
  return prisma.work.create({
    data: {
      userId,
      challengeId,
      title,
      content,
      originalUrl,
      workStatus: WORK_STATUS.draft,
    },
  });
}

export async function getWorkById(id) {
  return prisma.work.findUnique({
    where: { id },
  });
}

export async function listWorks({ challengeId, userId, workStatus }) {
  const where = {};

  if (typeof challengeId === "number") where.challengeId = challengeId;
  if (typeof userId === "string") where.userId = userId;
  if (workStatus) where.workStatus = workStatus;

  return prisma.work.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateWork({ id, userId, data }) {
  const existing = await prisma.work.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("작업물을 찾을 수 없습니다."), { status: 404 });
  }
  if (existing.userId !== userId) {
    throw Object.assign(new Error("수정 권한이 없습니다."), { status: 403 });
  }

  const updateData = { ...data };
  if (data.workStatus === WORK_STATUS.done) {
    updateData.submittedAt = updateData.submittedAt || new Date();
  }
  if (data.workStatus === WORK_STATUS.draft) {
    updateData.submittedAt = null;
  }

  return prisma.work.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteWork({ id, userId }) {
  const existing = await prisma.work.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("작업물을 찾을 수 없습니다."), { status: 404 });
  }
  if (existing.userId !== userId) {
    throw Object.assign(new Error("삭제 권한이 없습니다."), { status: 403 });
  }

  return prisma.work.delete({ where: { id } });
}

export const WorkStatus = WORK_STATUS;
