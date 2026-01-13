import { prisma } from "../../config/prisma.js";

export async function findUserById(userId) {
  const id = Number(userId);

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nickname: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
