import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

// Get all email templates
export const getEmailTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.query;

    const where: any = {};
    if (category) where.category = category;

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { category: "asc" },
    });

    res.json({
      success: true,
      data: templates,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get single template
export const getEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateId } = req.params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    res.json({
      success: true,
      data: template,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Create email template
export const createEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      displayName,
      category,
      subject,
      htmlContent,
      textContent,
      variables,
    } = req.body;

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        displayName,
        category,
        subject,
        htmlContent,
        textContent,
        variables,
      },
    });

    res.status(201).json({
      success: true,
      message: "Email template created",
      data: template,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Update email template
export const updateEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateId } = req.params;
    const updates = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: updates,
    });

    res.json({
      success: true,
      message: "Template updated",
      data: template,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Delete email template
export const deleteEmailTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateId } = req.params;

    await prisma.emailTemplate.delete({
      where: { id: templateId },
    });

    res.json({
      success: true,
      message: "Template deleted",
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get email logs
export const getEmailLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, tenantId, page = "1", limit = "50" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        include: {
          template: {
            select: {
              displayName: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.emailLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get email stats
export const getEmailStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [totalSent, sent, failed, pending, last24Hours] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: "SENT" } }),
      prisma.emailLog.count({ where: { status: "FAILED" } }),
      prisma.emailLog.count({ where: { status: "PENDING" } }),
      prisma.emailLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Emails by category
    const byCategory = await prisma.emailLog.groupBy({
      by: ["templateId"],
      _count: { templateId: true },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalSent,
          sent,
          failed,
          pending,
          last24Hours,
          successRate:
            totalSent > 0 ? ((sent / totalSent) * 100).toFixed(2) : 0,
        },
        byCategory,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Send test email
export const sendTestEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateId, recipient, variables } = req.body;

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    // Replace variables in template
    let htmlContent = template.htmlContent;
    let subject = template.subject;

    if (variables) {
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(regex, variables[key]);
        subject = subject.replace(regex, variables[key]);
      });
    }

    // Log the email (in real app, send via SMTP/SendGrid/etc)
   await prisma.emailLog.create({
      data: {
        templateId,
        recipient,
        subject,
        status: "SENT", // Would be PENDING in real app
        sentAt: new Date(),
        metadata: { variables, test: true },
      },
    });

    res.json({
      success: true,
      message: "Test email sent (simulated)",
      data: {
        subject,
        recipient,
        preview: htmlContent.substring(0, 200),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};
