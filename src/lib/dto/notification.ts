// 通知管理のDTO定義

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'system' | 'sms';
  variables: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateNotificationTemplateRequest {
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'system' | 'sms';
  variables?: Record<string, string>;
}

export interface UpdateNotificationTemplateRequest {
  id: string;
  name?: string;
  subject?: string;
  body?: string;
  type?: 'email' | 'system' | 'sms';
  variables?: Record<string, string>;
  isActive?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'user' | 'facility' | 'role';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  templateId?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateNotificationRequest {
  title: string;
  content: string;
  type: 'system' | 'user' | 'facility' | 'role';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  templateId?: string;
  scheduledAt?: Date;
  recipientIds?: string[];
  facilityIds?: string[];
  roleIds?: string[];
}

export interface UpdateNotificationRequest {
  id: string;
  title?: string;
  content?: string;
  type?: 'system' | 'user' | 'facility' | 'role';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  templateId?: string;
  scheduledAt?: Date;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  recipientId: string;
  recipientEmail?: string;
  recipientName?: string;
  deliveryType: 'email' | 'system' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  facilityId: string;
  notificationType: string;
  emailEnabled: boolean;
  systemEnabled: boolean;
  smsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNotificationSettingsRequest {
  userId: string;
  facilityId: string;
  notificationType: string;
  emailEnabled?: boolean;
  systemEnabled?: boolean;
  smsEnabled?: boolean;
}

export interface NotificationStats {
  id: string;
  notificationId: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  bounceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationListRequest {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationTemplateListRequest {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
  search?: string;
}

export interface NotificationTemplateListResponse {
  templates: NotificationTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationDeliveryListRequest {
  notificationId?: string;
  recipientId?: string;
  status?: string;
  deliveryType?: string;
  page?: number;
  limit?: number;
}

export interface NotificationDeliveryListResponse {
  deliveries: NotificationDelivery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationStatsRequest {
  notificationId?: string;
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month';
}

export interface NotificationStatsResponse {
  stats: NotificationStats[];
  summary: {
    totalNotifications: number;
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalFailed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
}

export interface SendNotificationRequest {
  notificationId: string;
  recipientIds?: string[];
  facilityIds?: string[];
  roleIds?: string[];
  immediate?: boolean;
}

export interface SendNotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryCount?: number;
}

export interface NotificationPreviewRequest {
  templateId: string;
  variables?: Record<string, string>;
  recipientEmail?: string;
}

export interface NotificationPreviewResponse {
  subject: string;
  body: string;
  html: string;
  text: string;
}
