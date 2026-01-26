import prisma from "../../config/database.js";

// 좋아요 처리 전 작업물 존재 여부 확인.
const ensureWorkExists = async (workId) => {
  const work = await prisma.work.findUnique({
    where: { id: workId },
    select: { id: true },
  });

  if (!work) {
    throw Object.assign(new Error("작업물을 찾을 수 없습니다."), { status: 404 });
  }
};

export async function getLikeCount({ workId }) {
  await ensureWorkExists(workId);

  // 작업물의 좋아요 개수 조회.
  const count = await prisma.like.count({ where: { workId } });
  return { count };
}

export async function addLike({ workId, userId }) {
  await ensureWorkExists(workId);

  // 멱등 추가: 이미 있으면 생성하지 않고 개수 반환.
  return prisma.$transaction(async (tx) => {
    const existing = await tx.like.findUnique({
      where: {
        userId_workId: {
          userId,
          workId,
        },
      },
    });

    if (!existing) {
      await tx.like.create({
        data: {
          userId,
          workId,
        },
      });
    }

    const count = await tx.like.count({ where: { workId } });
    return { count };
  });
}

export async function removeLike({ workId, userId }) {
  await ensureWorkExists(workId);

  // 멱등 삭제: 존재하면 삭제하고 개수 반환.
  return prisma.$transaction(async (tx) => {
    await tx.like.deleteMany({
      where: {
        userId,
        workId,
      },
    });

    const count = await tx.like.count({ where: { workId } });
    return { count };
  });
}
