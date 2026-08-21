import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";

async function main() {
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    console.log("Connecting Prisma...");

    await prisma.$connect();

    console.log("✅ Prisma connected");

    const result = await prisma.$queryRaw`
      SELECT NOW()
    `;

    console.log("Database time:", result);

    console.log("Testing User query...");

    const users = await prisma.user.findMany({
      take: 1,
    });

    console.log("✅ User query successful");
    console.log(users);
  } catch (error) {
    console.error("❌ Prisma test failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log("Prisma disconnected");
  }
}

main();