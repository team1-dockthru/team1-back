import { PrismaClient } from "@prisma/client";

// PrismaClient는 DATABASE_URL 환경 변수를 자동으로 읽습니다
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
