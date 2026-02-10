/**
 * ========================================
 * EMAIL TEMPLATES - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/email-templates.types.ts
 */

export interface CreateEmailTemplateRequestDto {
  name: string;
  displayName: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: any;
}

export interface UpdateEmailTemplateRequestDto {
  name?: string;
  displayName?: string;
  category?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: any;
  isActive?: boolean;
}

export interface SendTestEmailRequestDto {
  templateId: string;
  recipient: string;
  variables?: any;
}

export interface EmailTemplateDto {
  id: string;
  name: string;
  displayName: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  variables: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLogDto {
  id: string;
  templateId: string | null;
  tenantId: string | null;
  recipient: string;
  subject: string;
  status: string;
  sentAt: Date | null;
  metadata: any;
  createdAt: Date;
}

export interface EmailLogsResponseDto {
  logs: EmailLogDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmailStatsDto {
  stats: {
    totalSent: number;
    sent: number;
    failed: number;
    pending: number;
    last24Hours: number;
    successRate: string;
  };
  byCategory: any[];
}
