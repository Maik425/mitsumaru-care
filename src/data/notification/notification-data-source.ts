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
import { emailService } from '@/lib/services/email-service';
import { supabase } from '@/lib/supabase';

export interface NotificationDataSource {
  // 通知テンプレート管理
  createTemplate(
    request: CreateNotificationTemplateRequest
  ): Promise<NotificationTemplate>;
  updateTemplate(
    request: UpdateNotificationTemplateRequest
  ): Promise<NotificationTemplate>;
  deleteTemplate(id: string): Promise<void>;
  getTemplate(id: string): Promise<NotificationTemplate | null>;
  listTemplates(
    request: NotificationTemplateListRequest
  ): Promise<NotificationTemplateListResponse>;

  // 通知管理
  createNotification(request: CreateNotificationRequest): Promise<Notification>;
  updateNotification(request: UpdateNotificationRequest): Promise<Notification>;
  deleteNotification(id: string): Promise<void>;
  getNotification(id: string): Promise<Notification | null>;
  listNotifications(
    request: NotificationListRequest
  ): Promise<NotificationListResponse>;

  // 通知配信管理
  sendNotification(
    request: SendNotificationRequest
  ): Promise<SendNotificationResponse>;
  getDelivery(id: string): Promise<NotificationDelivery | null>;
  listDeliveries(
    request: NotificationDeliveryListRequest
  ): Promise<NotificationDeliveryListResponse>;
  updateDeliveryStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<void>;

  // 通知設定管理
  getSettings(
    userId: string,
    facilityId: string,
    notificationType: string
  ): Promise<NotificationSettings | null>;
  updateSettings(
    request: UpdateNotificationSettingsRequest
  ): Promise<NotificationSettings>;
  listUserSettings(userId: string): Promise<NotificationSettings[]>;

  // 通知統計
  getStats(
    request: NotificationStatsRequest
  ): Promise<NotificationStatsResponse>;
  updateStats(
    notificationId: string,
    stats: Partial<NotificationStats>
  ): Promise<void>;

  // 通知プレビュー
  previewNotification(
    request: NotificationPreviewRequest
  ): Promise<NotificationPreviewResponse>;
}

export class SupabaseNotificationDataSource implements NotificationDataSource {
  private client = supabase;

  // 通知テンプレート管理
  async createTemplate(
    request: CreateNotificationTemplateRequest
  ): Promise<NotificationTemplate> {
    const { data, error } = await this.client
      .from('notification_templates')
      .insert({
        name: request.name,
        subject: request.subject,
        body: request.body,
        type: request.type,
        variables: request.variables || {},
        is_active: true,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`テンプレート作成エラー: ${error.message}`);
    }

    return this.mapTemplateFromDb(data);
  }

  async updateTemplate(
    request: UpdateNotificationTemplateRequest
  ): Promise<NotificationTemplate> {
    const updateData: any = {};
    if (request.name !== undefined) updateData.name = request.name;
    if (request.subject !== undefined) updateData.subject = request.subject;
    if (request.body !== undefined) updateData.body = request.body;
    if (request.type !== undefined) updateData.type = request.type;
    if (request.variables !== undefined)
      updateData.variables = request.variables;
    if (request.isActive !== undefined) updateData.is_active = request.isActive;

    const { data, error } = await (this.client as any)
      .from('notification_templates')
      .update(updateData)
      .eq('id', request.id)
      .select()
      .single();

    if (error) {
      throw new Error(`テンプレート更新エラー: ${error.message}`);
    }

    return this.mapTemplateFromDb(data);
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await this.client
      .from('notification_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`テンプレート削除エラー: ${error.message}`);
    }
  }

  async getTemplate(id: string): Promise<NotificationTemplate | null> {
    const { data, error } = await this.client
      .from('notification_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`テンプレート取得エラー: ${error.message}`);
    }

    return this.mapTemplateFromDb(data);
  }

  async listTemplates(
    request: NotificationTemplateListRequest
  ): Promise<NotificationTemplateListResponse> {
    const page = request.page || 1;
    const limit = request.limit || 10;
    const offset = (page - 1) * limit;

    let query = this.client
      .from('notification_templates')
      .select('*', { count: 'exact' });

    if (request.type) {
      query = query.eq('type', request.type);
    }
    if (request.isActive !== undefined) {
      query = query.eq('is_active', request.isActive);
    }
    if (request.search) {
      query = query.or(
        `name.ilike.%${request.search}%,subject.ilike.%${request.search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`テンプレート一覧取得エラー: ${error.message}`);
    }

    return {
      templates: data?.map(this.mapTemplateFromDb) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // 通知管理
  async createNotification(
    request: CreateNotificationRequest
  ): Promise<Notification> {
    const { data, error } = await this.client
      .from('notifications')
      .insert({
        title: request.title,
        content: request.content,
        type: request.type,
        priority: request.priority,
        status: 'draft',
        template_id: request.templateId,
        scheduled_at: request.scheduledAt,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`通知作成エラー: ${error.message}`);
    }

    return this.mapNotificationFromDb(data);
  }

  async updateNotification(
    request: UpdateNotificationRequest
  ): Promise<Notification> {
    const updateData: any = {};
    if (request.title !== undefined) updateData.title = request.title;
    if (request.content !== undefined) updateData.content = request.content;
    if (request.type !== undefined) updateData.type = request.type;
    if (request.priority !== undefined) updateData.priority = request.priority;
    if (request.status !== undefined) updateData.status = request.status;
    if (request.templateId !== undefined)
      updateData.template_id = request.templateId;
    if (request.scheduledAt !== undefined)
      updateData.scheduled_at = request.scheduledAt;

    const { data, error } = await (this.client as any)
      .from('notifications')
      .update(updateData)
      .eq('id', request.id)
      .select()
      .single();

    if (error) {
      throw new Error(`通知更新エラー: ${error.message}`);
    }

    return this.mapNotificationFromDb(data);
  }

  async deleteNotification(id: string): Promise<void> {
    const { error } = await this.client
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`通知削除エラー: ${error.message}`);
    }
  }

  async getNotification(id: string): Promise<Notification | null> {
    const { data, error } = await this.client
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`通知取得エラー: ${error.message}`);
    }

    return this.mapNotificationFromDb(data);
  }

  async listNotifications(
    request: NotificationListRequest
  ): Promise<NotificationListResponse> {
    const page = request.page || 1;
    const limit = request.limit || 10;
    const offset = (page - 1) * limit;

    let query = this.client
      .from('notifications')
      .select('*', { count: 'exact' });

    if (request.status) {
      query = query.eq('status', request.status);
    }
    if (request.type) {
      query = query.eq('type', request.type);
    }
    if (request.priority) {
      query = query.eq('priority', request.priority);
    }
    if (request.search) {
      query = query.or(
        `title.ilike.%${request.search}%,content.ilike.%${request.search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`通知一覧取得エラー: ${error.message}`);
    }

    return {
      notifications: data?.map(this.mapNotificationFromDb) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // 通知配信管理
  async sendNotification(
    request: SendNotificationRequest
  ): Promise<SendNotificationResponse> {
    try {
      // 通知の取得
      const notification = await this.getNotification(request.notificationId);
      if (!notification) {
        throw new Error('通知が見つかりません');
      }

      // 配信対象の決定
      let recipientIds: string[] = [];

      if (request.recipientIds) {
        recipientIds = request.recipientIds;
      } else if (request.facilityIds) {
        // 施設のユーザーを取得
        const { data: facilityUsers } = await this.client
          .from('users')
          .select('id')
          .in('facility_id', request.facilityIds);
        recipientIds = facilityUsers?.map((u: any) => u.id) || [];
      } else if (request.roleIds) {
        // ロールのユーザーを取得（roleIdsは実際にはrole名の配列として扱う）
        const { data: roleUsers } = await this.client
          .from('users')
          .select('id')
          .in('role', request.roleIds);
        recipientIds = roleUsers?.map((u: any) => u.id) || [];
      } else if (notification.type === 'system') {
        // 全ユーザーを取得
        const { data: allUsers } = await this.client.from('users').select('id');
        recipientIds = allUsers?.map((u: any) => u.id) || [];
      }

      if (recipientIds.length === 0) {
        throw new Error('配信対象がありません');
      }

      // 配信レコードの作成
      const deliveries = recipientIds.map(recipientId => ({
        notification_id: request.notificationId,
        recipient_id: recipientId,
        delivery_type: 'email', // デフォルトはメール
        status: 'pending',
      }));

      const { error: deliveryError } = await this.client
        .from('notification_deliveries')
        .insert(deliveries as any);

      if (deliveryError) {
        throw new Error(`配信レコード作成エラー: ${deliveryError.message}`);
      }

      // 通知ステータスの更新
      await this.updateNotification({
        id: request.notificationId,
        status: request.immediate ? 'sending' : 'scheduled',
      });

      // 即座に送信する場合、実際のメール送信を実行
      if (request.immediate) {
        await this.processEmailDeliveries(request.notificationId, recipientIds);
      }

      return {
        success: true,
        deliveryCount: recipientIds.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 実際のメール送信処理
  private async processEmailDeliveries(
    notificationId: string,
    recipientIds: string[]
  ): Promise<void> {
    try {
      // 通知情報を取得
      const notification = await this.getNotification(notificationId);
      if (!notification) {
        throw new Error('通知が見つかりません');
      }

      // 受信者のメールアドレスを取得
      const { data: recipients } = await this.client
        .from('users')
        .select('id, email, name')
        .in('id', recipientIds);

      if (!recipients || recipients.length === 0) {
        throw new Error('受信者が見つかりません');
      }

      // 各受信者にメール送信
      for (const recipient of recipients as any[]) {
        try {
          // 配信レコードを取得
          const { data: delivery } = await this.client
            .from('notification_deliveries')
            .select('id')
            .eq('notification_id', notificationId)
            .eq('recipient_id', recipient.id)
            .single();

          if (!delivery) {
            console.error(`配信レコードが見つかりません: ${recipient.id}`);
            continue;
          }

          // メール送信
          const emailResult = await emailService.sendNotificationEmail(
            recipient.email,
            recipient.name,
            {
              subject: notification.title,
              body: notification.content,
              variables: {
                user_name: recipient.name,
                notification_title: notification.title,
                notification_content: notification.content,
              },
            }
          );

          // 配信ステータスを更新
          await this.updateDeliveryStatus(
            (delivery as any).id,
            emailResult.success ? 'sent' : 'failed',
            emailResult.error
          );

          // 統計を更新
          if (emailResult.success) {
            await this.updateStats(notificationId, {
              sentCount: 1,
            });
          } else {
            await this.updateStats(notificationId, {
              failedCount: 1,
            });
          }
        } catch (error) {
          console.error(`メール送信エラー (${recipient.email}):`, error);

          // 配信レコードを取得してステータスを更新
          const { data: delivery } = await this.client
            .from('notification_deliveries')
            .select('id')
            .eq('notification_id', notificationId)
            .eq('recipient_id', recipient.id)
            .single();

          if (delivery) {
            await this.updateDeliveryStatus(
              (delivery as any).id,
              'failed',
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
        }
      }

      // 通知ステータスを更新
      await this.updateNotification({
        id: notificationId,
        status: 'sent',
      });
    } catch (error) {
      console.error('メール送信処理エラー:', error);

      // 通知ステータスを失敗に更新
      await this.updateNotification({
        id: notificationId,
        status: 'failed',
      });
    }
  }

  async getDelivery(id: string): Promise<NotificationDelivery | null> {
    const { data, error } = await this.client
      .from('notification_deliveries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`配信取得エラー: ${error.message}`);
    }

    return this.mapDeliveryFromDb(data);
  }

  async listDeliveries(
    request: NotificationDeliveryListRequest
  ): Promise<NotificationDeliveryListResponse> {
    const page = request.page || 1;
    const limit = request.limit || 10;
    const offset = (page - 1) * limit;

    let query = this.client
      .from('notification_deliveries')
      .select('*', { count: 'exact' });

    if (request.notificationId) {
      query = query.eq('notification_id', request.notificationId);
    }
    if (request.recipientId) {
      query = query.eq('recipient_id', request.recipientId);
    }
    if (request.status) {
      query = query.eq('status', request.status);
    }
    if (request.deliveryType) {
      query = query.eq('delivery_type', request.deliveryType);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`配信一覧取得エラー: ${error.message}`);
    }

    return {
      deliveries: data?.map(this.mapDeliveryFromDb) || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async updateDeliveryStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    const updateData: any = { status };
    if (errorMessage) updateData.error_message = errorMessage;
    if (status === 'sent') updateData.sent_at = new Date().toISOString();
    if (status === 'delivered')
      updateData.delivered_at = new Date().toISOString();

    const { error } = await (this.client as any)
      .from('notification_deliveries')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`配信ステータス更新エラー: ${error.message}`);
    }
  }

  // 通知設定管理
  async getSettings(
    userId: string,
    facilityId: string,
    notificationType: string
  ): Promise<NotificationSettings | null> {
    const { data, error } = await this.client
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .eq('notification_type', notificationType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`通知設定取得エラー: ${error.message}`);
    }

    return this.mapSettingsFromDb(data);
  }

  async updateSettings(
    request: UpdateNotificationSettingsRequest
  ): Promise<NotificationSettings> {
    const { data, error } = await this.client
      .from('notification_settings')
      .upsert({
        user_id: request.userId,
        facility_id: request.facilityId,
        notification_type: request.notificationType,
        email_enabled: request.emailEnabled ?? true,
        system_enabled: request.systemEnabled ?? true,
        sms_enabled: request.smsEnabled ?? false,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`通知設定更新エラー: ${error.message}`);
    }

    return this.mapSettingsFromDb(data);
  }

  async listUserSettings(userId: string): Promise<NotificationSettings[]> {
    const { data, error } = await this.client
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`ユーザー通知設定取得エラー: ${error.message}`);
    }

    return data?.map(this.mapSettingsFromDb) || [];
  }

  // 通知統計
  async getStats(
    request: NotificationStatsRequest
  ): Promise<NotificationStatsResponse> {
    let query = this.client.from('notification_stats').select('*');

    if (request.notificationId) {
      query = query.eq('notification_id', request.notificationId);
    }
    if (request.startDate) {
      query = query.gte('created_at', request.startDate.toISOString());
    }
    if (request.endDate) {
      query = query.lte('created_at', request.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`通知統計取得エラー: ${error.message}`);
    }

    const stats = data?.map(this.mapStatsFromDb) || [];

    // サマリー計算
    const summary = {
      totalNotifications: stats.length,
      totalSent: stats.reduce((sum: number, s: any) => sum + s.sentCount, 0),
      totalDelivered: stats.reduce(
        (sum: number, s: any) => sum + s.deliveredCount,
        0
      ),
      totalOpened: stats.reduce(
        (sum: number, s: any) => sum + s.openedCount,
        0
      ),
      totalClicked: stats.reduce(
        (sum: number, s: any) => sum + s.clickedCount,
        0
      ),
      totalFailed: stats.reduce(
        (sum: number, s: any) => sum + s.failedCount,
        0
      ),
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
    };

    if (summary.totalSent > 0) {
      summary.deliveryRate = (summary.totalDelivered / summary.totalSent) * 100;
    }
    if (summary.totalDelivered > 0) {
      summary.openRate = (summary.totalOpened / summary.totalDelivered) * 100;
    }
    if (summary.totalOpened > 0) {
      summary.clickRate = (summary.totalClicked / summary.totalOpened) * 100;
    }

    return { stats, summary };
  }

  async updateStats(
    notificationId: string,
    stats: Partial<NotificationStats>
  ): Promise<void> {
    // 既存の統計を取得
    const { data: existingStats } = await this.client
      .from('notification_stats')
      .select('*')
      .eq('notification_id', notificationId)
      .single();

    if (existingStats) {
      // 既存の統計を更新
      const existing = existingStats as any;
      const updatedStats = {
        ...existing,
        ...stats,
        sentCount: (existing.sentCount || 0) + (stats.sentCount || 0),
        failedCount: (existing.failedCount || 0) + (stats.failedCount || 0),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await (this.client as any)
        .from('notification_stats')
        .update(updatedStats)
        .eq('notification_id', notificationId);

      if (error) {
        throw new Error(`統計更新エラー: ${error.message}`);
      }
    } else {
      // 新しい統計レコードを作成
      const { error } = await this.client.from('notification_stats').insert({
        notification_id: notificationId,
        sent_count: stats.sentCount || 0,
        failed_count: stats.failedCount || 0,
        delivered_count: stats.deliveredCount || 0,
        opened_count: stats.openedCount || 0,
        clicked_count: stats.clickedCount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      if (error) {
        throw new Error(`統計作成エラー: ${error.message}`);
      }
    }
  }

  // 通知プレビュー
  async previewNotification(
    request: NotificationPreviewRequest
  ): Promise<NotificationPreviewResponse> {
    const template = await this.getTemplate(request.templateId);
    if (!template) {
      throw new Error('テンプレートが見つかりません');
    }

    let subject = template.subject;
    let body = template.body;

    if (request.variables) {
      Object.entries(request.variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        body = body.replace(new RegExp(placeholder, 'g'), value);
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">みつまるケア システム通知</h2>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${body.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          このメールは自動送信されています。返信は不要です。
        </p>
      </div>
    `;

    const text = `
みつまるケア システム通知

${body}

このメールは自動送信されています。返信は不要です。
    `;

    return { subject, body, html, text };
  }

  // マッピング関数
  private mapTemplateFromDb(data: any): NotificationTemplate {
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      type: data.type,
      variables: data.variables || {},
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
    };
  }

  private mapNotificationFromDb(data: any): Notification {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      type: data.type,
      priority: data.priority,
      status: data.status,
      templateId: data.template_id,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
    };
  }

  private mapDeliveryFromDb(data: any): NotificationDelivery {
    return {
      id: data.id,
      notificationId: data.notification_id,
      recipientId: data.recipient_id,
      recipientEmail: data.recipient_email,
      recipientName: data.recipient_name,
      deliveryType: data.delivery_type,
      status: data.status,
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
      openedAt: data.opened_at ? new Date(data.opened_at) : undefined,
      clickedAt: data.clicked_at ? new Date(data.clicked_at) : undefined,
      errorMessage: data.error_message,
      retryCount: data.retry_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapSettingsFromDb(data: any): NotificationSettings {
    return {
      id: data.id,
      userId: data.user_id,
      facilityId: data.facility_id,
      notificationType: data.notification_type,
      emailEnabled: data.email_enabled,
      systemEnabled: data.system_enabled,
      smsEnabled: data.sms_enabled,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapStatsFromDb(data: any): NotificationStats {
    return {
      id: data.id,
      notificationId: data.notification_id,
      totalRecipients: data.total_recipients,
      sentCount: data.sent_count,
      deliveredCount: data.delivered_count,
      openedCount: data.opened_count,
      clickedCount: data.clicked_count,
      failedCount: data.failed_count,
      bounceCount: data.bounce_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
