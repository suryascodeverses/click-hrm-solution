import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export async function checkPrismaConnection() {
  try {
    // Lightweight health check
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Prisma DB connection successful");
  } catch (error) {
    console.error("❌ Prisma DB connection failed:", error);
    throw error;
  }
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
