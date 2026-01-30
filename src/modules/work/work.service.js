import prisma from "../../config/database.js";

const WORK_STATUS = {
  draft: "draft",
  done: "done",
};
const DEFAULT_PAGE_SIZE = 5;

export async function createWork({ userId, challengeId, title, content, originalUrl }) {
  // 챌린지 초안 작업물 생성.
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

export async function listWorks({ challengeId, userId, workStatus, page = 1, limit = DEFAULT_PAGE_SIZE }) {
  const where = {};

  if (typeof challengeId === "number") where.challengeId = challengeId;
  if (typeof userId === "string") where.userId = userId;
  if (workStatus) where.workStatus = workStatus;

  // 좋아요 수 기준 정렬 + 오프셋 페이지네이션.
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.work.findMany({
      where,
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.work.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function updateWork({ id, userId, data }) {
  // 소유권 확인 및 상태 변경 시 submittedAt 처리.
  const existing = await prisma.work.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("작업물을 찾을 수 없습니다."), { status: 404 });
  }
  
  // userId를 정수로 변환 (스키마에서 Int 타입)
  const userIdInt = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  
  // 소유권 비교 (둘 다 Int로 비교)
  if (existing.userId !== userIdInt) {
    throw Object.assign(new Error("수정 권한이 없습니다."), { status: 403 });
  }

  const updateData = { ...data };
  if (data.workStatus === WORK_STATUS.done) {
    updateData.submittedAt = updateData.submittedAt || new Date();
    
    // 작업물 제출 완료 시 챌린지 참여자로 자동 등록 (APPROVED 상태로)
    try {
      const existingParticipant = await prisma.challengeParticipant.findUnique({
        where: {
          userId_challengeId: {
            userId: userIdInt,
            challengeId: existing.challengeId,
          },
        },
        select: {
          id: true,
          participantStatus: true,
        },
      });

      if (!existingParticipant) {
        // 참여자가 없으면 새로 생성
        await prisma.challengeParticipant.create({
          data: {
            challengeId: existing.challengeId,
            userId: userIdInt,
            participantStatus: "APPROVED",
          },
        });
        console.log(`[Work] 참여자 등록 완료: userId=${userIdInt}, challengeId=${existing.challengeId}`);
      } else if (existingParticipant.participantStatus !== "APPROVED") {
        // 참여자가 있지만 APPROVED가 아니면 APPROVED로 업데이트
        await prisma.challengeParticipant.update({
          where: {
            userId_challengeId: {
              userId: userIdInt,
              challengeId: existing.challengeId,
            },
          },
          data: {
            participantStatus: "APPROVED",
          },
        });
        console.log(`[Work] 참여자 상태 업데이트: userId=${userIdInt}, challengeId=${existing.challengeId}, PENDING -> APPROVED`);
      }
    } catch (err) {
      console.error(`[Work] 참여자 등록/업데이트 실패:`, err);
      // 참여자 등록 실패해도 작업물 업데이트는 진행
    }
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
  // 삭제 전 소유권 확인.
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
