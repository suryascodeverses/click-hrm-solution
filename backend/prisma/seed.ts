import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ============================================
  // 1. CREATE SUPER ADMIN
  // ============================================
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@arm.com";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuAdmin@123";

  const existingSuperAdmin = await prisma.superAdmin.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    await prisma.superAdmin.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: "Super Administrator",
      },
    });

    console.log("✅ Super Admin created:", {
      email: superAdminEmail,
      password: superAdminPassword,
    });
  } else {
    console.log("ℹ️  Super Admin already exists");
  }

  // ============================================
  // 2. CREATE SUBSCRIPTION PLANS
  // ============================================
  const plans = [
    {
      name: "FREE",
      displayName: "Free Plan",
      price: 0,
      maxEmployees: 10,
      maxOrganisations: 1,
      features: ["Basic HRMS", "1 Organisation", "Up to 10 employees"],
    },
    {
      name: "BASIC",
      displayName: "Basic Plan",
      price: 49,
      yearlyPrice: 490,
      maxEmployees: 50,
      maxOrganisations: 3,
      features: [
        "All Free features",
        "3 Organisations",
        "Up to 50 employees",
        "Email support",
      ],
    },
    {
      name: "PREMIUM",
      displayName: "Premium Plan",
      price: 99,
      yearlyPrice: 990,
      maxEmployees: 200,
      maxOrganisations: 10,
      features: [
        "All Basic features",
        "10 Organisations",
        "Up to 200 employees",
        "Priority support",
        "Custom reports",
      ],
    },
    {
      name: "ENTERPRISE",
      displayName: "Enterprise Plan",
      price: 299,
      yearlyPrice: 2990,
      maxEmployees: 99999,
      maxOrganisations: 99999,
      features: [
        "Unlimited everything",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
      ],
    },
  ];

  console.log("📦 Creating subscription plans...");
  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { name: plan.name },
    });

    if (!existing) {
      await prisma.subscriptionPlan.create({ data: plan });
      console.log(`  ✅ Created plan: ${plan.displayName}`);
    }
  }

  // ============================================
  // 3. CREATE EMAIL TEMPLATES
  // ============================================
  const templates = [
    {
      name: "welcome_email",
      displayName: "Welcome Email",
      category: "AUTHENTICATION",
      subject: "Welcome to {{company}}!",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Welcome to {{company}}!</h1>
          <p>Hi {{name}},</p>
          <p>We're excited to have you on board. Your account has been successfully created.</p>
          <p>You can now access all the features of our HRMS platform.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The {{company}} Team</p>
        </div>
      `,
      variables: ["name", "company", "email"],
    },
    {
      name: "invoice_email",
      displayName: "Invoice Email",
      category: "BILLING",
      subject: "Invoice {{invoiceNumber}} from {{company}}",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Invoice {{invoiceNumber}}</h1>
          <p>Dear {{name}},</p>
          <p>Your invoice for {{company}} is ready.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount Due:</strong> ${{ amount: 1200 }}</p>
            <p><strong>Due Date:</strong> {{dueDate}}</p>
            <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
          </div>
          <p>Please process the payment at your earliest convenience.</p>
          <p>Thank you for your business!</p>
        </div>
      `,
      variables: ["name", "company", "invoiceNumber", "amount", "dueDate"],
    },
    {
      name: "leave_approved",
      displayName: "Leave Approved Email",
      category: "NOTIFICATIONS",
      subject: "Your leave request has been approved",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Leave Request Approved ✓</h1>
          <p>Hi {{name}},</p>
          <p>Good news! Your leave request has been approved.</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Leave Type:</strong> {{leaveType}}</p>
            <p><strong>From:</strong> {{startDate}}</p>
            <p><strong>To:</strong> {{endDate}}</p>
            <p><strong>Days:</strong> {{days}}</p>
          </div>
          <p>Enjoy your time off!</p>
          <p>Best regards,<br>HR Team</p>
        </div>
      `,
      variables: ["name", "leaveType", "startDate", "endDate", "days"],
    },
    {
      name: "payslip_generated",
      displayName: "Payslip Generated Email",
      category: "NOTIFICATIONS",
      subject: "Your payslip for {{month}} {{year}} is ready",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Payslip Ready</h1>
          <p>Hi {{name}},</p>
          <p>Your payslip for {{month}} {{year}} has been generated and is now available.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Net Pay:</strong> ${{ netPay: 1200 }}</p>
            <p><strong>Payment Date:</strong> {{paymentDate}}</p>
          </div>
          <p>You can download your payslip from the HRMS portal.</p>
          <p>Best regards,<br>Payroll Team</p>
        </div>
      `,
      variables: ["name", "month", "year", "netPay", "paymentDate"],
    },
    {
      name: "password_reset",
      displayName: "Password Reset Email",
      category: "AUTHENTICATION",
      subject: "Reset your password",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Password Reset Request</h1>
          <p>Hi {{name}},</p>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
      variables: ["name", "resetLink"],
    },
  ];

  console.log("📧 Creating email templates...");
  for (const template of templates) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { name: template.name },
    });

    if (!existing) {
      await prisma.emailTemplate.create({ data: template as any });
      console.log(`  ✅ Created template: ${template.displayName}`);
    }
  }

  // ============================================
  // 4. CREATE SAMPLE SYSTEM ALERTS
  // ============================================
  console.log("🚨 Creating sample system alerts...");

  const alerts = [
    {
      alertType: "PERFORMANCE",
      severity: "MEDIUM",
      title: "High CPU Usage Detected",
      message: "CPU usage has exceeded 80% for the last 15 minutes.",
      metadata: { cpu: 85.5, threshold: 80 },
    },
    {
      alertType: "CAPACITY",
      severity: "HIGH",
      title: "Database Storage Warning",
      message:
        "Database storage is at 75% capacity. Consider cleanup or upgrade.",
      metadata: { currentSize: "7.5GB", maxSize: "10GB" },
    },
  ];

  for (const alert of alerts) {
    await prisma.systemAlert.create({ data: alert as any });
  }
  console.log("  ✅ Created sample alerts");

  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Super Admin: ${superAdminEmail}`);
  console.log(`  - Subscription Plans: ${plans.length}`);
  console.log(`  - Email Templates: ${templates.length}`);
  console.log(`  - System Alerts: ${alerts.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
