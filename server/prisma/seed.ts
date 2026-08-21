import "dotenv/config";

import * as bcrypt from 'bcrypt';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  console.log("🌱 Starting database seed...");

  // Check required environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFirstName = process.env.ADMIN_FIRST_NAME || "System";
  const adminLastName = process.env.ADMIN_LAST_NAME || "Admin";

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is missing in .env");
  }

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is missing in .env");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env");
  }

  // Create Prisma adapter
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  // Create Prisma client
  const prisma = new PrismaClient({
    adapter,
  });

  try {
    // Connect to database
    await prisma.$connect();

    console.log("✅ Prisma connected");

    // Normalize email
    const email = adminEmail.trim().toLowerCase();

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");

      // Make sure existing user is ADMIN
      if (existingAdmin.role !== "ADMIN") {
        await prisma.user.update({
          where: {
            id: existingAdmin.id,
          },
          data: {
            role: "ADMIN",
          },
        });

        console.log("✅ Existing user promoted to ADMIN");
      } else {
        console.log("✅ Existing user is already ADMIN");
      }

      return;
    }

    // Hash admin password
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Create admin
    const admin = await prisma.user.create({
      data: {
        firstName: adminFirstName,
        lastName: adminLastName,
        email,
        passwordHash,
        role: "ADMIN",
        isActive: true,
        isEmailVerified: true,
      },
    });

    console.log("✅ Default admin created");
    console.log("📧 Admin email:", admin.email);
    console.log("👤 Admin role:", admin.role);
  } catch (error) {
    console.error("❌ Seed failed:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected");
  }
}

main();