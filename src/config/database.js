import { PrismaClient } from "../generated/prisma/client.js";
import { ENV } from "./env.js";

const prisma = new PrismaClient({
  datasourceUrl: ENV.DATABASE_URL,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
