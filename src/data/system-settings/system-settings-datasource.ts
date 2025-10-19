import {
  CreateNotificationSetting,
  CreateNotificationTemplate,
  CreateSecuritySetting,
  CreateSettingApproval,
  CreateSettingChangeHistory,
  CreateSystemSetting,
  NotificationSetting,
  NotificationTemplate,
  SecuritySetting,
  SettingApproval,
  SettingChangeHistory,
  SystemSetting,
  UpdateNotificationSetting,
  UpdateNotificationTemplate,
  UpdateSecuritySetting,
  UpdateSystemSetting,
} from '@/lib/dto/system-settings.dto';

export interface SystemSettingsDataSource {
  // システム設定
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSettingByKey(key: string): Promise<SystemSetting | null>;
  createSystemSetting(data: CreateSystemSetting): Promise<SystemSetting>;
  updateSystemSetting(
    key: string,
    data: UpdateSystemSetting
  ): Promise<SystemSetting>;
  deleteSystemSetting(key: string): Promise<void>;

  // 通知設定
  getNotificationSettings(): Promise<NotificationSetting[]>;
  getNotificationSetting(id: string): Promise<NotificationSetting | null>;
  createNotificationSetting(
    data: CreateNotificationSetting
  ): Promise<NotificationSetting>;
  updateNotificationSetting(
    id: string,
    data: UpdateNotificationSetting
  ): Promise<NotificationSetting>;
  deleteNotificationSetting(id: string): Promise<void>;

  // 通知テンプレート
  getNotificationTemplates(): Promise<NotificationTemplate[]>;
  getNotificationTemplate(id: string): Promise<NotificationTemplate | null>;
  createNotificationTemplate(
    data: CreateNotificationTemplate
  ): Promise<NotificationTemplate>;
  updateNotificationTemplate(
    id: string,
    data: UpdateNotificationTemplate
  ): Promise<NotificationTemplate>;
  deleteNotificationTemplate(id: string): Promise<void>;

  // セキュリティ設定
  getSecuritySettings(): Promise<SecuritySetting[]>;
  getSecuritySettingByKey(key: string): Promise<SecuritySetting | null>;
  createSecuritySetting(data: CreateSecuritySetting): Promise<SecuritySetting>;
  updateSecuritySetting(
    key: string,
    data: UpdateSecuritySetting
  ): Promise<SecuritySetting>;
  deleteSecuritySetting(key: string): Promise<void>;

  // 設定変更履歴
  getSettingChangeHistory(
    limit?: number,
    offset?: number
  ): Promise<SettingChangeHistory[]>;
  getSettingChangeHistoryById(id: string): Promise<SettingChangeHistory | null>;
  createSettingChangeHistory(
    data: CreateSettingChangeHistory
  ): Promise<SettingChangeHistory>;
  updateSettingChangeHistoryApproval(
    id: string,
    approvedBy: string,
    approvalStatus: string
  ): Promise<SettingChangeHistory>;

  // 設定承認
  getSettingApprovals(changeHistoryId: string): Promise<SettingApproval[]>;
  createSettingApproval(data: CreateSettingApproval): Promise<SettingApproval>;
  updateSettingApproval(
    id: string,
    data: Partial<CreateSettingApproval>
  ): Promise<SettingApproval>;

  // 通知配信履歴
  createNotificationDelivery(data: {
    template_id: string | null;
    recipient_email: string;
    recipient_name: string;
    subject: string;
    body: string;
    delivery_status: string;
    sent_at: string;
  }): Promise<any>;
}
