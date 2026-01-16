import { PrismaClient } from "@prisma/client";

// 개발 환경에서만 쿼리 로그 출력
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
