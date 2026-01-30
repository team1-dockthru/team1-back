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

export async function getWorkById(id, currentUserId = null) {
  const work = await prisma.work.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
      challenge: {
        select: {
          id: true,
          title: true,
          field: true,
          docType: true,
        },
      },
      feedbacks: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              profileImage: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3, // 최초 3개만
      },
      _count: {
        select: {
          feedbacks: true,
          likes: true,
        },
      },
    },
  });

  if (!work) return null;

  // 현재 사용자의 좋아요 여부 확인
  let isLiked = false;
  if (currentUserId) {
    const like = await prisma.like.findUnique({
      where: {
        userId_workId: {
          userId: currentUserId,
          workId: id,
        },
      },
    });
    isLiked = !!like;
  }

  // 응답 형식 변환
  return {
    id: work.id,
    title: work.title,
    content: work.content,
    originalUrl: work.originalUrl,
    workStatus: work.workStatus,
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
    submittedAt: work.submittedAt,
    // 챌린지 정보
    field: work.challenge?.field,
    docType: work.challenge?.docType,
    challengeId: work.challengeId,
    challengeTitle: work.challenge?.title,
    // 작성자 정보
    author: {
      id: work.user?.id,
      nickname: work.user?.nickname,
      profileImage: work.user?.profileImage,
    },
    // 좋아요 정보
    likeCount: work._count?.likes || 0,
    isLiked: isLiked,
    // 피드백 정보
    feedbacks: work.feedbacks.map((f) => ({
      id: f.id,
      content: f.content,
      createdAt: f.createdAt,
      author: {
        id: f.user?.id,
        nickname: f.user?.nickname,
        profileImage: f.user?.profileImage,
      },
    })),
    totalFeedbackCount: work._count?.feedbacks || 0,
    // 본인 작업물 여부
    isMine: currentUserId ? work.userId === currentUserId : false,
  };
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
