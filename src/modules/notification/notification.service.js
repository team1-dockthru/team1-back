import prisma from "../../config/database.js";

const DEFAULT_PAGE_SIZE = 10;

// 무한 스크롤용 커서 필터 생성.
const buildCursorFilter = (cursor) => {
  if (!cursor) return {};

  const [createdAtRaw, idRaw] = cursor.split("|");
  const createdAt = new Date(createdAtRaw);
  const id = Number(idRaw);

  if (!createdAtRaw || Number.isNaN(createdAt.getTime()) || !Number.isInteger(id)) {
    const error = new Error("cursor 형식이 올바르지 않습니다.");
    error.status = 400;
    throw error;
  }

  return {
    OR: [
      { createdAt: { lt: createdAt } },
      { createdAt, id: { lt: id } },
    ],
  };
};

export async function listNotifications({
  userId,
  cursor,
  limit = DEFAULT_PAGE_SIZE,
  includeRead = false,
}) {
  const where = {
    userId,
    ...(!includeRead ? { readAt: null } : {}),
    ...buildCursorFilter(cursor),
  };

  // 다음 페이지 여부 확인을 위해 limit+1 조회.
  const take = limit + 1;

  const items = await prisma.notification.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    select: {
      id: true,
      type: true,
      message: true,
      challengeId: true,
      workId: true,
      createdAt: true,
      readAt: true,
    },
  });

  const hasNext = items.length > limit;
  const sliced = items.slice(0, limit);
  const lastItem = sliced[sliced.length - 1];

  // 다음 스크롤 요청용 커서 생성.
  return {
    items: sliced,
    nextCursor: hasNext && lastItem ? `${lastItem.createdAt.toISOString()}|${lastItem.id}` : null,
    hasNext,
  };
}

export async function markNotificationRead({ id, userId }) {
  // 읽음 처리 전 소유권 확인.
  const existing = await prisma.notification.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      type: true,
      message: true,
      challengeId: true,
      workId: true,
      createdAt: true,
      readAt: true,
    },
  });

  if (!existing) {
    throw Object.assign(new Error("알림을 찾을 수 없습니다."), { status: 404 });
  }
  if (existing.userId !== userId) {
    throw Object.assign(new Error("읽음 처리 권한이 없습니다."), { status: 403 });
  }

  // 멱등 처리: 이미 읽음이면 그대로 반환.
  if (existing.readAt) {
    return existing;
  }

  // 읽음 시각 기록.
  return prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
    select: {
      id: true,
      type: true,
      message: true,
      challengeId: true,
      workId: true,
      createdAt: true,
      readAt: true,
    },
  });
}