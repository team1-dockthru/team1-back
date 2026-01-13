import prisma from "../../lib/prisma.js";

export const checkDb = async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
};