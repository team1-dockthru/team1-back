import prisma from "../../config/database.js";

const CHALLENGE_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  CLOSED: "CLOSED",
};

const DOC_TYPE = {
  OFFICIAL_DOCUMENT: "OFFICIAL_DOCUMENT",
  BLOG: "BLOG",
};

const PARTICIPANT_STATUS = {
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  APPROVED: "APPROVED",
  CHALLENGE_DELETED: "CHALLENGE_DELETED",
};

const REQUEST_STATUS = {
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
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

export async function adminDeleteChallenge({ id, userId, role, adminReason }) {
  const existing = await prisma.challenge.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("챌린지를 찾을 수 없습니다."), { status: 404 });
  }

  // 관리자만 삭제 가능
  if (role !== "ADMIN") {
    throw Object.assign(new Error("챌린지 삭제 권한이 없습니다."), { status: 403 });
  }

  // 삭제 시 adminReason 필수
  if (!adminReason || typeof adminReason !== "string" || adminReason.trim() === "") {
    throw Object.assign(new Error("삭제 사유는 필수입니다."), { status: 400 });
  }

  // 삭제 전에 adminReason과 deletedAt을 저장
  await prisma.challenge.update({
    where: { id },
    data: {
      adminReason,
      deletedAt: new Date(),
    },
  });

  // 그 후 삭제
  return prisma.challenge.delete({ where: { id } });
}

export async function adminRejectChallenge({ id, userId, role, adminReason }) {
  const existing = await prisma.challenge.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("챌린지를 찾을 수 없습니다."), { status: 404 });
  }

  // 관리자만 거절 가능
  if (role !== "ADMIN") {
    throw Object.assign(new Error("챌린지 거절 권한이 없습니다."), { status: 403 });
  }

  // 이미 마감된 챌린지는 거절할 수 없음
  if (existing.challengeStatus === CHALLENGE_STATUS.CLOSED) {
    throw Object.assign(new Error("이미 마감된 챌린지는 거절할 수 없습니다."), { status: 400 });
  }

  // 거절 시 adminReason 필수
  if (!adminReason || typeof adminReason !== "string" || adminReason.trim() === "") {
    throw Object.assign(new Error("거절 사유는 필수입니다."), { status: 400 });
  }

  return prisma.challenge.update({
    where: { id },
    data: {
      challengeStatus: CHALLENGE_STATUS.CLOSED,
      adminReason,
    },
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

export async function createParticipant({ challengeId, userId }) {
  // 챌린지 존재 확인
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      _count: {
        select: {
          participants: {
            where: {
              participantStatus: PARTICIPANT_STATUS.APPROVED,
            },
          },
        },
      },
    },
  });

  if (!challenge) {
    throw Object.assign(new Error("챌린지를 찾을 수 없습니다."), { status: 404 });
  }

  // 챌린지가 마감되었는지 확인
  if (challenge.challengeStatus === CHALLENGE_STATUS.CLOSED) {
    throw Object.assign(new Error("마감된 챌린지에는 참여할 수 없습니다."), { status: 400 });
  }

  // 최대 참여 인원 확인
  if (challenge._count.participants >= challenge.maxParticipants) {
    throw Object.assign(new Error("최대 참여 인원에 도달했습니다."), { status: 400 });
  }

  // 이미 참여 신청했는지 확인
  const existing = await prisma.challengeParticipant.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
  });

  if (existing) {
    if (existing.participantStatus === PARTICIPANT_STATUS.APPROVED) {
      throw Object.assign(new Error("이미 참여 승인된 챌린지입니다."), { status: 400 });
    }
    if (existing.participantStatus === PARTICIPANT_STATUS.PENDING) {
      throw Object.assign(new Error("이미 참여 신청한 챌린지입니다."), { status: 400 });
    }
    // REJECTED나 CHALLENGE_DELETED 상태면 다시 신청 가능하도록 업데이트
    return prisma.challengeParticipant.update({
      where: { id: existing.id },
      data: {
        participantStatus: PARTICIPANT_STATUS.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
    });
  }

  // 새 참여 신청 생성
  return prisma.challengeParticipant.create({
    data: {
      userId,
      challengeId,
      participantStatus: PARTICIPANT_STATUS.PENDING,
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
    },
  });
}

export async function listParticipants({ challengeId, userId, role }) {
  // 챌린지 존재 확인
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    throw Object.assign(new Error("챌린지를 찾을 수 없습니다."), { status: 404 });
  }

  // 권한 확인: 챌린지 생성자 또는 관리자만 조회 가능
  if (challenge.userId !== userId && role !== "ADMIN") {
    throw Object.assign(new Error("참여자 목록 조회 권한이 없습니다."), { status: 403 });
  }

  return prisma.challengeParticipant.findMany({
    where: { challengeId },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateParticipantStatus({ challengeId, participantId, userId, role, status }) {
  // 참여 신청 존재 확인
  const participant = await prisma.challengeParticipant.findUnique({
    where: { id: participantId },
    include: {
      challenge: true,
    },
  });

  if (!participant) {
    throw Object.assign(new Error("참여 신청을 찾을 수 없습니다."), { status: 404 });
  }

  // 챌린지 ID 일치 확인
  if (participant.challengeId !== challengeId) {
    throw Object.assign(new Error("챌린지 ID가 일치하지 않습니다."), { status: 400 });
  }

  // 권한 확인: 챌린지 생성자 또는 관리자만 상태 변경 가능
  if (participant.challenge.userId !== userId && role !== "ADMIN") {
    throw Object.assign(new Error("참여 신청 상태 변경 권한이 없습니다."), { status: 403 });
  }

  // 상태 유효성 검사
  if (!Object.values(PARTICIPANT_STATUS).includes(status)) {
    throw Object.assign(new Error("유효하지 않은 참여 상태입니다."), { status: 400 });
  }

  // 승인 시 최대 참여 인원 확인
  if (status === PARTICIPANT_STATUS.APPROVED) {
    const approvedCount = await prisma.challengeParticipant.count({
      where: {
        challengeId,
        participantStatus: PARTICIPANT_STATUS.APPROVED,
      },
    });

    if (approvedCount >= participant.challenge.maxParticipants) {
      throw Object.assign(new Error("최대 참여 인원에 도달했습니다."), { status: 400 });
    }
  }

  return prisma.challengeParticipant.update({
    where: { id: participantId },
    data: {
      participantStatus: status,
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
    },
  });
}

export async function deleteParticipant({ challengeId, participantId, userId }) {
  // 참여 신청 존재 확인
  const participant = await prisma.challengeParticipant.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    throw Object.assign(new Error("참여 신청을 찾을 수 없습니다."), { status: 404 });
  }

  // 챌린지 ID 일치 확인
  if (participant.challengeId !== challengeId) {
    throw Object.assign(new Error("챌린지 ID가 일치하지 않습니다."), { status: 400 });
  }

  // 본인만 취소 가능
  if (participant.userId !== userId) {
    throw Object.assign(new Error("참여 신청 취소 권한이 없습니다."), { status: 403 });
  }

  // 이미 승인된 경우 취소 불가
  if (participant.participantStatus === PARTICIPANT_STATUS.APPROVED) {
    throw Object.assign(new Error("이미 승인된 참여 신청은 취소할 수 없습니다."), { status: 400 });
  }

  return prisma.challengeParticipant.delete({
    where: { id: participantId },
  });
}

export async function createChallengeRequest({
  userId,
  title,
  sourceUrl,
  field,
  docType,
  deadlineAt,
  maxParticipants,
  content,
}) {
  return prisma.challengeRequest.create({
    data: {
      userId,
      title,
      sourceUrl,
      field,
      docType,
      deadlineAt: new Date(deadlineAt),
      maxParticipants,
      content,
      requestStatus: REQUEST_STATUS.PENDING,
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
    },
  });
}

export async function listChallengeRequests({ userId, requestStatus }) {
  const where = {};

  if (typeof userId === "number") where.userId = userId;
  if (requestStatus) where.requestStatus = requestStatus;

  return prisma.challengeRequest.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
      challenges: {
        select: { id: true },
        take: 1,
      },
      _count: {
        select: {
          challenges: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChallengeRequestById(id) {
  return prisma.challengeRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
      challenges: {
        select: { id: true },
        take: 1,
      },
      _count: {
        select: {
          challenges: true,
        },
      },
    },
  });
}

export async function updateChallengeRequest({ id, userId, data }) {
  const existing = await prisma.challengeRequest.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("챌린지 생성 신청을 찾을 수 없습니다."), { status: 404 });
  }

  // 본인만 수정 가능
  if (existing.userId !== userId) {
    throw Object.assign(new Error("수정 권한이 없습니다."), { status: 403 });
  }

  // PENDING 상태일 때만 수정 가능
  if (existing.requestStatus !== REQUEST_STATUS.PENDING) {
    throw Object.assign(new Error("신청중 상태일 때만 수정할 수 있습니다."), { status: 400 });
  }

  const updateData = { ...data };
  if (data.deadlineAt) {
    updateData.deadlineAt = new Date(data.deadlineAt);
  }

  return prisma.challengeRequest.update({
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
          challenges: true,
        },
      },
    },
  });
}

export async function deleteChallengeRequest({ id, userId }) {
  const existing = await prisma.challengeRequest.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("챌린지 생성 신청을 찾을 수 없습니다."), { status: 404 });
  }

  // 본인만 삭제 가능
  if (existing.userId !== userId) {
    throw Object.assign(new Error("삭제 권한이 없습니다."), { status: 403 });
  }

  // PENDING 상태일 때만 취소 가능
  if (existing.requestStatus !== REQUEST_STATUS.PENDING) {
    throw Object.assign(new Error("신청중 상태일 때만 취소할 수 있습니다."), { status: 400 });
  }

  return prisma.challengeRequest.delete({ where: { id } });
}

export async function processChallengeRequest({ id, userId, role, status, adminReason }) {
  const existing = await prisma.challengeRequest.findUnique({ where: { id } });

  if (!existing) {
    throw Object.assign(new Error("챌린지 생성 신청을 찾을 수 없습니다."), { status: 404 });
  }

  // 관리자만 처리 가능
  if (role !== "ADMIN") {
    throw Object.assign(new Error("챌린지 생성 신청 처리 권한이 없습니다."), { status: 403 });
  }

  // PENDING 상태일 때만 처리 가능
  if (existing.requestStatus !== REQUEST_STATUS.PENDING) {
    throw Object.assign(new Error("신청중 상태일 때만 처리할 수 있습니다."), { status: 400 });
  }

  // 상태 유효성 검사
  if (!Object.values(REQUEST_STATUS).includes(status)) {
    throw Object.assign(new Error("유효하지 않은 신청 상태입니다."), { status: 400 });
  }

  // 거절 시 adminReason 필수
  if (status === REQUEST_STATUS.REJECTED && !adminReason) {
    throw Object.assign(new Error("거절 시 거절 사유는 필수입니다."), { status: 400 });
  }

  const updateData = {
    requestStatus: status,
    processedAt: new Date(),
  };

  if (adminReason) {
    updateData.adminReason = adminReason;
  }

  return prisma.challengeRequest.update({
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
          challenges: true,
        },
      },
    },
  });
}

export const ChallengeStatus = CHALLENGE_STATUS;
export const DocType = DOC_TYPE;
export const ParticipantStatus = PARTICIPANT_STATUS;
export const RequestStatus = REQUEST_STATUS;
