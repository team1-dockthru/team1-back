import prisma from "../../config/database.js";

const CHALLENGE_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  CLOSED: "CLOSED",
};

const DOC_TYPE = {
  OFFICIAL_DOCUMENT: "OFFICIAL_DOCUMENT",
  BLOG: "BLOG",
};

export async function createChallenge({
  userId,
  challengeRequestId,
  title,
  sourceUrl,
  field,
  docType,
  deadlineAt,
  maxParticipants,
  content,
}) {
  return prisma.challenge.create({
    data: {
      userId,
      challengeRequestId: challengeRequestId || null,
      title,
      sourceUrl,
      field,
      docType,
      deadlineAt: new Date(deadlineAt),
      maxParticipants,
      content,
      challengeStatus: CHALLENGE_STATUS.IN_PROGRESS,
    },
  });
}

export async function getChallengeById(id) {
  return prisma.challenge.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
      challengeRequest: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          participants: true,
          works: true,
        },
      },
    },
  });
}

export async function listChallenges({ userId, challengeStatus, field, docType }) {
  const where = {};

  if (typeof userId === "number") where.userId = userId;
  if (challengeStatus) where.challengeStatus = challengeStatus;
  if (field) where.field = field;
  if (docType) where.docType = docType;

  return prisma.challenge.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
      _count: {
        select: {
          participants: true,
          works: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateChallenge({ id, userId, data }) {
  const existing = await prisma.challenge.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("챌린지를 찾을 수 없습니다."), { status: 404 });
  }
  if (existing.userId !== userId) {
    throw Object.assign(new Error("수정 권한이 없습니다."), { status: 403 });
  }

  const updateData = { ...data };
  if (data.deadlineAt) {
    updateData.deadlineAt = new Date(data.deadlineAt);
  }

  return prisma.challenge.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
      _count: {
        select: {
          participants: true,
          works: true,
        },
      },
    },
  });
}

export async function deleteChallenge({ id, userId }) {
  const existing = await prisma.challenge.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("챌린지를 찾을 수 없습니다."), { status: 404 });
  }
  if (existing.userId !== userId) {
    throw Object.assign(new Error("삭제 권한이 없습니다."), { status: 403 });
  }

  return prisma.challenge.delete({ where: { id } });
}

export const ChallengeStatus = CHALLENGE_STATUS;
export const DocType = DOC_TYPE;
