import { SupabaseSystemSettingsDataSource } from '@/data/system-settings/supabase-system-settings-datasource';
import {
  CreateNotificationSettingDto,
  CreateNotificationTemplateDto,
  CreateSecuritySettingDto,
  CreateSystemSettingDto,
  UpdateNotificationSettingDto,
  UpdateNotificationTemplateDto,
  UpdateSecuritySettingDto,
  UpdateSystemSettingDto,
} from '@/lib/dto/system-settings.dto';
import { SystemSettingsRepository } from '@/lib/repositories/system-settings.repository';
import { emailService } from '@/lib/services/email-service';
import { router, systemAdminProcedure } from '@/server/trpc';
import { z } from 'zod';

// リポジトリのインスタンスを作成
const systemSettingsRepository = new SystemSettingsRepository(
  new SupabaseSystemSettingsDataSource()
);

export const systemSettingsRouter = router({
  // システム設定
  getSystemSettings: systemAdminProcedure.query(async ({ ctx }) => {
    return systemSettingsRepository.getSystemSettings();
  }),

  getSystemSettingByKey: systemAdminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input, ctx }) => {
      return systemSettingsRepository.getSystemSettingByKey(input.key);
    }),

  createSystemSetting: systemAdminProcedure
    .input(CreateSystemSettingDto)
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.createSystemSetting(input);
    }),

  updateSystemSetting: systemAdminProcedure
    .input(
      z.object({
        key: z.string(),
        data: UpdateSystemSettingDto,
        changeReason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.updateSystemSettingWithHistory(
        input.key,
        input.data,
        ctx.user.id,
        input.changeReason
      );
    }),

  deleteSystemSetting: systemAdminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.deleteSystemSetting(input.key);
    }),

  // 通知設定
  getNotificationSettings: systemAdminProcedure.query(async ({ ctx }) => {
    return systemSettingsRepository.getNotificationSettings();
  }),

  getNotificationSetting: systemAdminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return systemSettingsRepository.getNotificationSetting(input.id);
    }),

  createNotificationSetting: systemAdminProcedure
    .input(CreateNotificationSettingDto)
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.createNotificationSetting(input);
    }),

  updateNotificationSetting: systemAdminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: UpdateNotificationSettingDto,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.updateNotificationSetting(
        input.id,
        input.data
      );
    }),

  deleteNotificationSetting: systemAdminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.deleteNotificationSetting(input.id);
    }),

  // 通知テンプレート
  getNotificationTemplates: systemAdminProcedure.query(async ({ ctx }) => {
    return systemSettingsRepository.getNotificationTemplates();
  }),

  getNotificationTemplate: systemAdminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return systemSettingsRepository.getNotificationTemplate(input.id);
    }),

  createNotificationTemplate: systemAdminProcedure
    .input(CreateNotificationTemplateDto)
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.createNotificationTemplate(input);
    }),

  updateNotificationTemplate: systemAdminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: UpdateNotificationTemplateDto,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.updateNotificationTemplate(
        input.id,
        input.data
      );
    }),

  deleteNotificationTemplate: systemAdminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.deleteNotificationTemplate(input.id);
    }),

  // セキュリティ設定
  getSecuritySettings: systemAdminProcedure.query(async ({ ctx }) => {
    return systemSettingsRepository.getSecuritySettings();
  }),

  getSecuritySettingByKey: systemAdminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input, ctx }) => {
      return systemSettingsRepository.getSecuritySettingByKey(input.key);
    }),

  createSecuritySetting: systemAdminProcedure
    .input(CreateSecuritySettingDto)
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.createSecuritySetting(input);
    }),

  updateSecuritySetting: systemAdminProcedure
    .input(
      z.object({
        key: z.string(),
        data: UpdateSecuritySettingDto,
        changeReason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.updateSecuritySettingWithHistory(
        input.key,
        input.data,
        ctx.user.id,
        input.changeReason
      );
    }),

  deleteSecuritySetting: systemAdminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.deleteSecuritySetting(input.key);
    }),

  // 設定変更履歴
  getSettingChangeHistory: systemAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      return systemSettingsRepository.getSettingChangeHistory(
        input.limit,
        input.offset
      );
    }),

  getSettingChangeHistoryById: systemAdminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return systemSettingsRepository.getSettingChangeHistoryById(input.id);
    }),

  // 設定承認
  getSettingApprovals: systemAdminProcedure
    .input(z.object({ changeHistoryId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return systemSettingsRepository.getSettingApprovals(
        input.changeHistoryId
      );
    }),

  // メンテナンスモード制御
  toggleMaintenanceMode: systemAdminProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return systemSettingsRepository.updateSystemSettingWithHistory(
        'maintenance_mode',
        { value: input.enabled.toString(), description: null },
        ctx.user.id,
        input.reason || 'メンテナンスモードの切り替え'
      );
    }),

  // メール送信テスト
  testEmailConnection: systemAdminProcedure.query(async ({ ctx }) => {
    try {
      const isConnected = await emailService.testConnection();
      return {
        success: isConnected,
        message: isConnected ? 'SMTP接続が正常です' : 'SMTP接続に失敗しました',
      };
    } catch (error) {
      return {
        success: false,
        message: `SMTP接続テストエラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }),

  sendTestEmail: systemAdminProcedure
    .input(
      z.object({
        recipientEmail: z.string().email(),
        recipientName: z.string().optional().default('テストユーザー'),
        templateId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // デフォルトのテストテンプレート
        const testTemplate = {
          subject: '【テスト】みつまるケア システム通知',
          body: `これはシステム通知機能のテストメールです。

送信情報:
- 送信日時: ${new Date().toLocaleString('ja-JP')}
- 送信者: ${ctx.user.email}
- テンプレートID: ${input.templateId || 'default'}

システム通知機能が正常に動作しています。`,
          variables: {
            user_name: input.recipientName,
            system_name: 'みつまるケア',
            current_time: new Date().toLocaleString('ja-JP'),
          },
        };

        const result = await emailService.sendNotificationEmail(
          input.recipientEmail,
          input.recipientName,
          testTemplate
        );

        if (result.success) {
          // 送信履歴をデータベースに記録
          await systemSettingsRepository.createNotificationDelivery({
            template_id: input.templateId || null,
            recipient_email: input.recipientEmail,
            recipient_name: input.recipientName,
            subject: testTemplate.subject,
            body: testTemplate.body,
            delivery_status: 'sent',
            sent_at: new Date().toISOString(),
          });
        }

        return {
          success: result.success,
          messageId: result.messageId,
          message: result.success
            ? 'テストメールが送信されました'
            : result.error,
        };
      } catch (error) {
        return {
          success: false,
          message: `メール送信エラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }),
});
