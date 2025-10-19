import { SystemSettingsDataSource } from '@/data/system-settings/system-settings-datasource';
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

export class SystemSettingsRepository {
  constructor(private dataSource: SystemSettingsDataSource) {}

  // システム設定
  async getSystemSettings(): Promise<SystemSetting[]> {
    return this.dataSource.getSystemSettings();
  }

  async getSystemSettingByKey(key: string): Promise<SystemSetting | null> {
    return this.dataSource.getSystemSettingByKey(key);
  }

  async createSystemSetting(data: CreateSystemSetting): Promise<SystemSetting> {
    return this.dataSource.createSystemSetting(data);
  }

  async updateSystemSetting(
    key: string,
    data: UpdateSystemSetting
  ): Promise<SystemSetting> {
    return this.dataSource.updateSystemSetting(key, data);
  }

  async deleteSystemSetting(key: string): Promise<void> {
    return this.dataSource.deleteSystemSetting(key);
  }

  // 通知設定
  async getNotificationSettings(): Promise<NotificationSetting[]> {
    return this.dataSource.getNotificationSettings();
  }

  async getNotificationSetting(
    id: string
  ): Promise<NotificationSetting | null> {
    return this.dataSource.getNotificationSetting(id);
  }

  async createNotificationSetting(
    data: CreateNotificationSetting
  ): Promise<NotificationSetting> {
    return this.dataSource.createNotificationSetting(data);
  }

  async updateNotificationSetting(
    id: string,
    data: UpdateNotificationSetting
  ): Promise<NotificationSetting> {
    return this.dataSource.updateNotificationSetting(id, data);
  }

  async deleteNotificationSetting(id: string): Promise<void> {
    return this.dataSource.deleteNotificationSetting(id);
  }

  // 通知テンプレート
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return this.dataSource.getNotificationTemplates();
  }

  async getNotificationTemplate(
    id: string
  ): Promise<NotificationTemplate | null> {
    return this.dataSource.getNotificationTemplate(id);
  }

  async createNotificationTemplate(
    data: CreateNotificationTemplate
  ): Promise<NotificationTemplate> {
    return this.dataSource.createNotificationTemplate(data);
  }

  async updateNotificationTemplate(
    id: string,
    data: UpdateNotificationTemplate
  ): Promise<NotificationTemplate> {
    return this.dataSource.updateNotificationTemplate(id, data);
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    return this.dataSource.deleteNotificationTemplate(id);
  }

  // セキュリティ設定
  async getSecuritySettings(): Promise<SecuritySetting[]> {
    return this.dataSource.getSecuritySettings();
  }

  async getSecuritySettingByKey(key: string): Promise<SecuritySetting | null> {
    return this.dataSource.getSecuritySettingByKey(key);
  }

  async createSecuritySetting(
    data: CreateSecuritySetting
  ): Promise<SecuritySetting> {
    return this.dataSource.createSecuritySetting(data);
  }

  async updateSecuritySetting(
    key: string,
    data: UpdateSecuritySetting
  ): Promise<SecuritySetting> {
    return this.dataSource.updateSecuritySetting(key, data);
  }

  async deleteSecuritySetting(key: string): Promise<void> {
    return this.dataSource.deleteSecuritySetting(key);
  }

  // 設定変更履歴
  async getSettingChangeHistory(
    limit?: number,
    offset?: number
  ): Promise<SettingChangeHistory[]> {
    return this.dataSource.getSettingChangeHistory(limit, offset);
  }

  async getSettingChangeHistoryById(
    id: string
  ): Promise<SettingChangeHistory | null> {
    return this.dataSource.getSettingChangeHistoryById(id);
  }

  async createSettingChangeHistory(
    data: CreateSettingChangeHistory
  ): Promise<SettingChangeHistory> {
    return this.dataSource.createSettingChangeHistory(data);
  }

  async updateSettingChangeHistoryApproval(
    id: string,
    approvedBy: string,
    approvalStatus: string
  ): Promise<SettingChangeHistory> {
    return this.dataSource.updateSettingChangeHistoryApproval(
      id,
      approvedBy,
      approvalStatus
    );
  }

  // 設定承認
  async getSettingApprovals(
    changeHistoryId: string
  ): Promise<SettingApproval[]> {
    return this.dataSource.getSettingApprovals(changeHistoryId);
  }

  async createSettingApproval(
    data: CreateSettingApproval
  ): Promise<SettingApproval> {
    return this.dataSource.createSettingApproval(data);
  }

  async updateSettingApproval(
    id: string,
    data: Partial<CreateSettingApproval>
  ): Promise<SettingApproval> {
    return this.dataSource.updateSettingApproval(id, data);
  }

  // ビジネスロジック
  async updateSystemSettingWithHistory(
    key: string,
    data: UpdateSystemSetting,
    changedBy: string,
    changeReason?: string
  ): Promise<SystemSetting> {
    // 現在の設定を取得
    const currentSetting = await this.getSystemSettingByKey(key);
    if (!currentSetting) {
      throw new Error('設定が見つかりません');
    }

    // 変更履歴を作成
    await this.createSettingChangeHistory({
      setting_type: 'system',
      setting_key: key,
      old_value: currentSetting.value,
      new_value: data.value,
      changed_by: changedBy,
      change_reason: changeReason || null,
    });

    // 設定を更新
    return this.updateSystemSetting(key, data);
  }

  async updateSecuritySettingWithHistory(
    key: string,
    data: UpdateSecuritySetting,
    changedBy: string,
    changeReason?: string
  ): Promise<SecuritySetting> {
    // 現在の設定を取得
    const currentSetting = await this.getSecuritySettingByKey(key);
    if (!currentSetting) {
      throw new Error('セキュリティ設定が見つかりません');
    }

    // 変更履歴を作成
    await this.createSettingChangeHistory({
      setting_type: 'security',
      setting_key: key,
      old_value: currentSetting.value,
      new_value: data.value,
      changed_by: changedBy,
      change_reason: changeReason || null,
    });

    // 設定を更新
    return this.updateSecuritySetting(key, data);
  }

  // 通知配信履歴
  async createNotificationDelivery(data: {
    template_id: string | null;
    recipient_email: string;
    recipient_name: string;
    subject: string;
    body: string;
    delivery_status: string;
    sent_at: string;
  }): Promise<any> {
    return this.dataSource.createNotificationDelivery(data);
  }
}
