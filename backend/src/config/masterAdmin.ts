import { hashPassword } from "../utils/password.utils";
import { prisma } from "./database";

/**
 * Creates or updates a SuperAdmin record.
 * @param email - The unique email for the admin
 * @param password - The plain text password (will be hashed)
 * @param name - The display name
 */
export async function createSuperAdmin() {
  try {
    const email: string = process.env.SUPER_ADMIN_EMAIL! || "admin@arm.com";
    const password: string = process.env.SUPER_ADMIN_PASSWORD! || "Super@1495";
    const name: string = "Master Admin";

    const hashedPassword = await hashPassword(password);

    const admin = await prisma.superAdmin.upsert({
      where: { email: email },
      update: {
        password: hashedPassword,
        name: name,
      },
      create: {
        email: email,
        password: hashedPassword,
        name: name,
      },
    });

    console.log(`✅ SuperAdmin ${admin.email} created/updated successfully.`);
    return admin;
  } catch (error) {
    console.error("❌ Error creating SuperAdmin:", error);
    throw error;
  }
}
