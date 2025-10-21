import { SupabaseNotificationDataSource } from '@/data/notification/notification-data-source';
import { NotificationRepository } from '@/lib/repositories/notification-repository';
import { protectedProcedure, router } from '@/server/trpc';
import { z } from 'zod';

// リポジトリのインスタンス作成
const notificationRepository = new NotificationRepository(
  new SupabaseNotificationDataSource()
);

export const notificationRouter = router({
  // 通知テンプレート管理
  templates: {
    // テンプレート一覧取得
    list: protectedProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
          type: z.enum(['email', 'system', 'sms']).optional(),
          isActive: z.boolean().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return notificationRepository.listTemplates(input);
      }),

    // テンプレート取得
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return notificationRepository.getTemplate(input.id);
      }),

    // テンプレート作成
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          subject: z.string().min(1).max(500),
          body: z.string().min(1),
          type: z.enum(['email', 'system', 'sms']),
          variables: z.record(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return notificationRepository.createTemplate(input);
      }),

    // テンプレート更新
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).max(255).optional(),
          subject: z.string().min(1).max(500).optional(),
          body: z.string().min(1).optional(),
          type: z.enum(['email', 'system', 'sms']).optional(),
          variables: z.record(z.string()).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return notificationRepository.updateTemplate(input);
      }),

    // テンプレート削除
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return notificationRepository.deleteTemplate(input.id);
      }),

    // テンプレートプレビュー
    preview: protectedProcedure
      .input(
        z.object({
          templateId: z.string(),
          variables: z.record(z.string()).optional(),
          recipientEmail: z.string().email().optional(),
        })
      )
      .query(async ({ input }) => {
        return notificationRepository.previewNotification(input);
      }),

    // テンプレート使用状況
    usage: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return notificationRepository.getTemplateWithUsage(input.id);
      }),
  },

  // 通知管理
  notifications: {
    // 通知一覧取得
    list: protectedProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
          status: z
            .enum([
              'draft',
              'scheduled',
              'sending',
              'sent',
              'failed',
              'cancelled',
            ])
            .optional(),
          type: z.enum(['system', 'user', 'facility', 'role']).optional(),
          priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return notificationRepository.listNotifications(input);
      }),

    // 通知取得
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return notificationRepository.getNotification(input.id);
      }),

    // 通知作成
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(500),
          content: z.string().min(1),
          type: z.enum(['system', 'user', 'facility', 'role']),
          priority: z.enum(['low', 'normal', 'high', 'urgent']),
          templateId: z.string().optional(),
          scheduledAt: z.date().optional(),
          recipientIds: z.array(z.string()).optional(),
          facilityIds: z.array(z.string()).optional(),
          roleIds: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return notificationRepository.createNotification(input);
      }),

    // 通知更新
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().min(1).max(500).optional(),
          content: z.string().min(1).optional(),
          type: z.enum(['system', 'user', 'facility', 'role']).optional(),
          priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
          status: z
            .enum([
              'draft',
              'scheduled',
              'sending',
              'sent',
              'failed',
              'cancelled',
            ])
            .optional(),
          templateId: z.string().optional(),
          scheduledAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return notificationRepository.updateNotification(input);
      }),

    // 通知削除
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return notificationRepository.deleteNotification(input.id);
      }),

    // 通知送信
    send: protectedProcedure
      .input(
        z.object({
          notificationId: z.string(),
          recipientIds: z.array(z.string()).optional(),
          facilityIds: z.array(z.string()).optional(),
          roleIds: z.array(z.string()).optional(),
          immediate: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        return notificationRepository.sendNotification(input);
      }),

    // 通知詳細（統計付き）
    getWithStats: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return notificationRepository.getNotificationWithStats(input.id);
      }),
  },

  // 通知配信管理
  deliveries: {
    // 配信一覧取得
    list: protectedProcedure
      .input(
        z.object({
          notificationId: z.string().optional(),
          recipientId: z.string().optional(),
          status: z
            .enum(['pending', 'sent', 'delivered', 'failed', 'bounced'])
            .optional(),
          deliveryType: z.enum(['email', 'system', 'sms']).optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
        })
      )
      .query(async ({ input }) => {
        return notificationRepository.listDeliveries(input);
      }),

    // 配信取得
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return notificationRepository.getDelivery(input.id);
      }),

    // 配信ステータス更新
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced']),
          errorMessage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return notificationRepository.updateDeliveryStatus(
          input.id,
          input.status,
          input.errorMessage
        );
      }),
  },

  // 通知設定管理
  settings: {
    // 設定取得
    get: protectedProcedure
      .input(
        z.object({
          userId: z.string(),
          facilityId: z.string(),
          notificationType: z.string(),
        })
      )
      .query(async ({ input }) => {
        return notificationRepository.getSettings(
          input.userId,
          input.facilityId,
          input.notificationType
        );
      }),

    // 設定更新
    update: protectedProcedure
      .input(
        z.object({
          userId: z.string(),
          facilityId: z.string(),
          notificationType: z.string(),
          emailEnabled: z.boolean().optional(),
          systemEnabled: z.boolean().optional(),
          smsEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return notificationRepository.updateSettings(input);
      }),

    // ユーザー設定一覧
    listUser: protectedProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return notificationRepository.listUserSettings(input.userId);
      }),
  },

  // 通知統計
  stats: {
    // 統計取得
    get: protectedProcedure
      .input(
        z.object({
          notificationId: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          groupBy: z.enum(['day', 'week', 'month']).optional(),
        })
      )
      .query(async ({ input }) => {
        return notificationRepository.getStats(input);
      }),

    // サマリー取得
    summary: protectedProcedure.query(async () => {
      return notificationRepository.getNotificationSummary();
    }),
  },
});
