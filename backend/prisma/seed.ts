import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create Super Admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@arm.com";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuAdmin@123";

  const existingSuperAdmin = await prisma.superAdmin.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = await prisma.superAdmin.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: "Super Administrator",
      },
    });

    console.log("✅ Super Admin created:", {
      email: superAdmin.email,
      password: superAdminPassword,
    });
  } else {
    console.log("ℹ️  Super Admin already exists");
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
