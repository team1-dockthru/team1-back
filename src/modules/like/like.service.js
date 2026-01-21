import prisma from "../../config/database.js";

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

  const count = await prisma.like.count({ where: { workId } });
  return { count };
}

export async function addLike({ workId, userId }) {
  await ensureWorkExists(workId);

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
