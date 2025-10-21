import { NotificationDataSource } from '@/data/notification/notification-data-source';
import {
  CreateNotificationRequest,
  CreateNotificationTemplateRequest,
  Notification,
  NotificationDelivery,
  NotificationDeliveryListRequest,
  NotificationDeliveryListResponse,
  NotificationListRequest,
  NotificationListResponse,
  NotificationPreviewRequest,
  NotificationPreviewResponse,
  NotificationSettings,
  NotificationStats,
  NotificationStatsRequest,
  NotificationStatsResponse,
  NotificationTemplate,
  NotificationTemplateListRequest,
  NotificationTemplateListResponse,
  SendNotificationRequest,
  SendNotificationResponse,
  UpdateNotificationRequest,
  UpdateNotificationSettingsRequest,
  UpdateNotificationTemplateRequest,
} from '@/lib/dto/notification';

export class NotificationRepository {
  constructor(private dataSource: NotificationDataSource) {}

  // 通知テンプレート管理
  async createTemplate(
    request: CreateNotificationTemplateRequest
  ): Promise<NotificationTemplate> {
    return this.dataSource.createTemplate(request);
  }

  async updateTemplate(
    request: UpdateNotificationTemplateRequest
  ): Promise<NotificationTemplate> {
    return this.dataSource.updateTemplate(request);
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.dataSource.deleteTemplate(id);
  }

  async getTemplate(id: string): Promise<NotificationTemplate | null> {
    return this.dataSource.getTemplate(id);
  }

  async listTemplates(
    request: NotificationTemplateListRequest
  ): Promise<NotificationTemplateListResponse> {
    return this.dataSource.listTemplates(request);
  }

  // 通知管理
  async createNotification(
    request: CreateNotificationRequest
  ): Promise<Notification> {
    return this.dataSource.createNotification(request);
  }

  async updateNotification(
    request: UpdateNotificationRequest
  ): Promise<Notification> {
    return this.dataSource.updateNotification(request);
  }

  async deleteNotification(id: string): Promise<void> {
    return this.dataSource.deleteNotification(id);
  }

  async getNotification(id: string): Promise<Notification | null> {
    return this.dataSource.getNotification(id);
  }

  async listNotifications(
    request: NotificationListRequest
  ): Promise<NotificationListResponse> {
    return this.dataSource.listNotifications(request);
  }

  // 通知配信管理
  async sendNotification(
    request: SendNotificationRequest
  ): Promise<SendNotificationResponse> {
    return this.dataSource.sendNotification(request);
  }

  async getDelivery(id: string): Promise<NotificationDelivery | null> {
    return this.dataSource.getDelivery(id);
  }

  async listDeliveries(
    request: NotificationDeliveryListRequest
  ): Promise<NotificationDeliveryListResponse> {
    return this.dataSource.listDeliveries(request);
  }

  async updateDeliveryStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    return this.dataSource.updateDeliveryStatus(id, status, errorMessage);
  }

  // 通知設定管理
  async getSettings(
    userId: string,
    facilityId: string,
    notificationType: string
  ): Promise<NotificationSettings | null> {
    return this.dataSource.getSettings(userId, facilityId, notificationType);
  }

  async updateSettings(
    request: UpdateNotificationSettingsRequest
  ): Promise<NotificationSettings> {
    return this.dataSource.updateSettings(request);
  }

  async listUserSettings(userId: string): Promise<NotificationSettings[]> {
    return this.dataSource.listUserSettings(userId);
  }

  // 通知統計
  async getStats(
    request: NotificationStatsRequest
  ): Promise<NotificationStatsResponse> {
    return this.dataSource.getStats(request);
  }

  async updateStats(
    notificationId: string,
    stats: Partial<NotificationStats>
  ): Promise<void> {
    return this.dataSource.updateStats(notificationId, stats);
  }

  // 通知プレビュー
  async previewNotification(
    request: NotificationPreviewRequest
  ): Promise<NotificationPreviewResponse> {
    return this.dataSource.previewNotification(request);
  }

  // ビジネスロジック
  async sendNotificationWithEmail(
    notificationId: string,
    recipientIds: string[],
    immediate: boolean = true
  ): Promise<SendNotificationResponse> {
    // 通知の取得
    const notification = await this.getNotification(notificationId);
    if (!notification) {
      return { success: false, error: '通知が見つかりません' };
    }

    // 配信レコードの作成
    const sendResult = await this.sendNotification({
      notificationId,
      recipientIds,
      immediate,
    });

    if (!sendResult.success) {
      return sendResult;
    }

    // メール送信の処理（実際の送信は別途実装）
    // ここでは配信レコードの作成のみ行う
    return sendResult;
  }

  async getNotificationWithStats(notificationId: string): Promise<{
    notification: Notification;
    stats: NotificationStats | null;
    deliveries: NotificationDelivery[];
  } | null> {
    const notification = await this.getNotification(notificationId);
    if (!notification) {
      return null;
    }

    const [statsResponse, deliveriesResponse] = await Promise.all([
      this.getStats({ notificationId }),
      this.listDeliveries({ notificationId, limit: 1000 }),
    ]);

    return {
      notification,
      stats: statsResponse.stats[0] || null,
      deliveries: deliveriesResponse.deliveries,
    };
  }

  async getTemplateWithUsage(templateId: string): Promise<{
    template: NotificationTemplate;
    usageCount: number;
  } | null> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      return null;
    }

    // テンプレートの使用回数を取得
    const notifications = await this.listNotifications({ limit: 1000 });
    const usageCount = notifications.notifications.filter(
      n => n.templateId === templateId
    ).length;

    return { template, usageCount };
  }

  async getNotificationSummary(): Promise<{
    totalNotifications: number;
    pendingNotifications: number;
    sentNotifications: number;
    failedNotifications: number;
    totalTemplates: number;
    activeTemplates: number;
  }> {
    const [notifications, templates] = await Promise.all([
      this.listNotifications({ limit: 1000 }),
      this.listTemplates({ limit: 1000 }),
    ]);

    const totalNotifications = notifications.total;
    const pendingNotifications = notifications.notifications.filter(
      n => n.status === 'draft' || n.status === 'scheduled'
    ).length;
    const sentNotifications = notifications.notifications.filter(
      n => n.status === 'sent'
    ).length;
    const failedNotifications = notifications.notifications.filter(
      n => n.status === 'failed'
    ).length;

    const totalTemplates = templates.total;
    const activeTemplates = templates.templates.filter(t => t.isActive).length;

    return {
      totalNotifications,
      pendingNotifications,
      sentNotifications,
      failedNotifications,
      totalTemplates,
      activeTemplates,
    };
  }
}
