import { Router } from "express";
import { authenticateSuperAdmin } from "../middlewares/superAdminAuth.middleware";
import {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getEmailLogs,
  getEmailStats,
  sendTestEmail,
} from "../controllers/emailTemplates.controller";

const router: Router = Router();

// Email Templates
router.get("/templates", authenticateSuperAdmin, getEmailTemplates);
router.get("/templates/:templateId", authenticateSuperAdmin, getEmailTemplate);
router.post("/templates", authenticateSuperAdmin, createEmailTemplate);
router.put(
  "/templates/:templateId",
  authenticateSuperAdmin,
  updateEmailTemplate
);
router.delete(
  "/templates/:templateId",
  authenticateSuperAdmin,
  deleteEmailTemplate
);

// Email Logs
router.get("/logs", authenticateSuperAdmin, getEmailLogs);
router.get("/stats", authenticateSuperAdmin, getEmailStats);

// Test Email
router.post("/send-test", authenticateSuperAdmin, sendTestEmail);

export default router;
