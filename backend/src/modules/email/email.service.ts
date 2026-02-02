import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";
import type {
  CreateEmailTemplateRequestDto,
  UpdateEmailTemplateRequestDto,
  SendTestEmailRequestDto,
  EmailTemplateDto,
  EmailLogDto,
  EmailLogsResponseDto,
  EmailStatsDto,
} from "@arm/shared";

export class EmailTemplatesService {
  async getEmailTemplates(category?: string): Promise<EmailTemplateDto[]> {
    const where: any = {};
    if (category) where.category = category;
    return await prisma.emailTemplate.findMany({
      where,
      orderBy: { category: "asc" },
    });
  }

  async getEmailTemplate(templateId: string): Promise<EmailTemplateDto> {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundError("Template not found");
    return template;
  }

  async createEmailTemplate(
    data: CreateEmailTemplateRequestDto,
  ): Promise<EmailTemplateDto> {
    return await prisma.emailTemplate.create({ data });
  }

  async updateEmailTemplate(
    templateId: string,
    data: UpdateEmailTemplateRequestDto,
  ): Promise<EmailTemplateDto> {
    return await prisma.emailTemplate.update({
      where: { id: templateId },
      data,
    });
  }

  async deleteEmailTemplate(templateId: string): Promise<void> {
    await prisma.emailTemplate.delete({ where: { id: templateId } });
  }

  async getEmailLogs(
    status?: string,
    tenantId?: string,
    page = 1,
    limit = 50,
  ): Promise<EmailLogsResponseDto> {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        include: {
          template: { select: { displayName: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.emailLog.count({ where }),
    ]);

    return {
      logs: logs as any,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getEmailStats(): Promise<EmailStatsDto> {
    const [totalSent, sent, failed, pending, last24Hours] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: "SENT" } }),
      prisma.emailLog.count({ where: { status: "FAILED" } }),
      prisma.emailLog.count({ where: { status: "PENDING" } }),
      prisma.emailLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const byCategory = await prisma.emailLog.groupBy({
      by: ["templateId"],
      _count: { templateId: true },
    });
    const successRate =
      totalSent > 0 ? ((sent / totalSent) * 100).toFixed(2) : "0";

    return {
      stats: { totalSent, sent, failed, pending, last24Hours, successRate },
      byCategory,
    };
  }

  async sendTestEmail(data: SendTestEmailRequestDto): Promise<any> {
    const { templateId, recipient, variables } = data;

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundError("Template not found");

    let htmlContent = template.htmlContent;
    let subject = template.subject;

    if (variables) {
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(regex, variables[key]);
        subject = subject.replace(regex, variables[key]);
      });
    }

    await prisma.emailLog.create({
      data: {
        templateId,
        recipient,
        subject,
        status: "SENT",
        sentAt: new Date(),
        metadata: { variables, test: true },
      },
    });

    return { subject, recipient, preview: htmlContent.substring(0, 200) };
  }
}
