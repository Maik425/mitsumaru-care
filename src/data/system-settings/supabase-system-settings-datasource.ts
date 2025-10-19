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
import { supabaseAdmin } from '@/lib/supabase/server';
import { SystemSettingsDataSource } from './system-settings-datasource';

export class SupabaseSystemSettingsDataSource
  implements SystemSettingsDataSource
{
  private supabase = supabaseAdmin;

  // システム設定
  async getSystemSettings(): Promise<SystemSetting[]> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) {
      throw new Error(`システム設定の取得に失敗しました: ${error.message}`);
    }

    return data || [];
  }

  async getSystemSettingByKey(key: string): Promise<SystemSetting | null> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`システム設定の取得に失敗しました: ${error.message}`);
    }

    return data;
  }

  async createSystemSetting(data: CreateSystemSetting): Promise<SystemSetting> {
    const { data: result, error } = await this.supabase
      .from('system_settings')
      .insert({
        key: data.key,
        value: data.value,
        category: data.category,
        description: data.description,
        is_encrypted: data.is_encrypted,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`システム設定の作成に失敗しました: ${error.message}`);
    }

    return result;
  }

  async updateSystemSetting(
    key: string,
    data: UpdateSystemSetting
  ): Promise<SystemSetting> {
    const { data: result, error } = await this.supabase
      .from('system_settings')
      .update({
        value: data.value,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select()
      .single();

    if (error) {
      throw new Error(`システム設定の更新に失敗しました: ${error.message}`);
    }

    return result;
  }

  async deleteSystemSetting(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('system_settings')
      .delete()
      .eq('key', key);

    if (error) {
      throw new Error(`システム設定の削除に失敗しました: ${error.message}`);
    }
  }

  // 通知設定
  async getNotificationSettings(): Promise<NotificationSetting[]> {
    const { data, error } = await this.supabase
      .from('notification_settings')
      .select('*')
      .order('notification_type', { ascending: true });

    if (error) {
      throw new Error(`通知設定の取得に失敗しました: ${error.message}`);
    }

    return data || [];
  }

  async getNotificationSetting(
    id: string
  ): Promise<NotificationSetting | null> {
    const { data, error } = await this.supabase
      .from('notification_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`通知設定の取得に失敗しました: ${error.message}`);
    }

    return data;
  }

  async createNotificationSetting(
    data: CreateNotificationSetting
  ): Promise<NotificationSetting> {
    const { data: result, error } = await this.supabase
      .from('notification_settings')
      .insert({
        notification_type: data.notification_type,
        is_enabled: data.is_enabled,
        template_id: data.template_id,
        delivery_method: data.delivery_method,
        schedule_config: data.schedule_config,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`通知設定の作成に失敗しました: ${error.message}`);
    }

    return result;
  }

  async updateNotificationSetting(
    id: string,
    data: UpdateNotificationSetting
  ): Promise<NotificationSetting> {
    const { data: result, error } = await this.supabase
      .from('notification_settings')
      .update({
        is_enabled: data.is_enabled,
        template_id: data.template_id,
        schedule_config: data.schedule_config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`通知設定の更新に失敗しました: ${error.message}`);
    }

    return result;
  }

  async deleteNotificationSetting(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notification_settings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`通知設定の削除に失敗しました: ${error.message}`);
    }
  }

  // 通知テンプレート
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const { data, error } = await this.supabase
      .from('notification_templates')
      .select('*')
      .order('template_type', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`通知テンプレートの取得に失敗しました: ${error.message}`);
    }

    return data || [];
  }

  async getNotificationTemplate(
    id: string
  ): Promise<NotificationTemplate | null> {
    const { data, error } = await this.supabase
      .from('notification_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`通知テンプレートの取得に失敗しました: ${error.message}`);
    }

    return data;
  }

  async createNotificationTemplate(
    data: CreateNotificationTemplate
  ): Promise<NotificationTemplate> {
    const { data: result, error } = await this.supabase
      .from('notification_templates')
      .insert({
        name: data.name,
        subject: data.subject,
        body: data.body,
        template_type: data.template_type,
        variables: data.variables,
        is_active: data.is_active,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`通知テンプレートの作成に失敗しました: ${error.message}`);
    }

    return result;
  }

  async updateNotificationTemplate(
    id: string,
    data: UpdateNotificationTemplate
  ): Promise<NotificationTemplate> {
    const { data: result, error } = await this.supabase
      .from('notification_templates')
      .update({
        name: data.name,
        subject: data.subject,
        body: data.body,
        variables: data.variables,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`通知テンプレートの更新に失敗しました: ${error.message}`);
    }

    return result;
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notification_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`通知テンプレートの削除に失敗しました: ${error.message}`);
    }
  }

  // セキュリティ設定
  async getSecuritySettings(): Promise<SecuritySetting[]> {
    const { data, error } = await this.supabase
      .from('security_settings')
      .select('*')
      .order('setting_type', { ascending: true })
      .order('setting_key', { ascending: true });

    if (error) {
      throw new Error(`セキュリティ設定の取得に失敗しました: ${error.message}`);
    }

    return data || [];
  }

  async getSecuritySettingByKey(key: string): Promise<SecuritySetting | null> {
    const { data, error } = await this.supabase
      .from('security_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`セキュリティ設定の取得に失敗しました: ${error.message}`);
    }

    return data;
  }

  async createSecuritySetting(
    data: CreateSecuritySetting
  ): Promise<SecuritySetting> {
    const { data: result, error } = await this.supabase
      .from('security_settings')
      .insert({
        setting_key: data.setting_key,
        value: data.value,
        setting_type: data.setting_type,
        description: data.description,
        is_active: data.is_active,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`セキュリティ設定の作成に失敗しました: ${error.message}`);
    }

    return result;
  }

  async updateSecuritySetting(
    key: string,
    data: UpdateSecuritySetting
  ): Promise<SecuritySetting> {
    const { data: result, error } = await this.supabase
      .from('security_settings')
      .update({
        value: data.value,
        updated_at: new Date().toISOString(),
      })
      .eq('setting_key', key)
      .select()
      .single();

    if (error) {
      throw new Error(`セキュリティ設定の更新に失敗しました: ${error.message}`);
    }

    return result;
  }

  async deleteSecuritySetting(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('security_settings')
      .delete()
      .eq('setting_key', key);

    if (error) {
      throw new Error(`セキュリティ設定の削除に失敗しました: ${error.message}`);
    }
  }

  // 設定変更履歴
  async getSettingChangeHistory(
    limit = 50,
    offset = 0
  ): Promise<SettingChangeHistory[]> {
    const { data, error } = await this.supabase
      .from('setting_change_history')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`設定変更履歴の取得に失敗しました: ${error.message}`);
    }

    return data || [];
  }

  async getSettingChangeHistoryById(
    id: string
  ): Promise<SettingChangeHistory | null> {
    const { data, error } = await this.supabase
      .from('setting_change_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`設定変更履歴の取得に失敗しました: ${error.message}`);
    }

    return data;
  }

  async createSettingChangeHistory(
    data: CreateSettingChangeHistory
  ): Promise<SettingChangeHistory> {
    const { data: result, error } = await this.supabase
      .from('setting_change_history')
      .insert({
        setting_type: data.setting_type,
        setting_key: data.setting_key,
        old_value: data.old_value,
        new_value: data.new_value,
        changed_by: data.changed_by,
        change_reason: data.change_reason,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`設定変更履歴の作成に失敗しました: ${error.message}`);
    }

    return result;
  }

  async updateSettingChangeHistoryApproval(
    id: string,
    approvedBy: string,
    approvalStatus: string
  ): Promise<SettingChangeHistory> {
    const { data: result, error } = await this.supabase
      .from('setting_change_history')
      .update({
        approval_status: approvalStatus,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`設定変更履歴の承認更新に失敗しました: ${error.message}`);
    }

    return result;
  }

  // 設定承認
  async getSettingApprovals(
    changeHistoryId: string
  ): Promise<SettingApproval[]> {
    const { data, error } = await this.supabase
      .from('setting_approvals')
      .select('*')
      .eq('change_history_id', changeHistoryId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`設定承認の取得に失敗しました: ${error.message}`);
    }

    return data || [];
  }

  async createSettingApproval(
    data: CreateSettingApproval
  ): Promise<SettingApproval> {
    const { data: result, error } = await this.supabase
      .from('setting_approvals')
      .insert({
        change_history_id: data.change_history_id,
        approver_id: data.approver_id,
        approval_status: data.approval_status,
        approval_comment: data.approval_comment,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`設定承認の作成に失敗しました: ${error.message}`);
    }

    return result;
  }

  async updateSettingApproval(
    id: string,
    data: Partial<CreateSettingApproval>
  ): Promise<SettingApproval> {
    const { data: result, error } = await this.supabase
      .from('setting_approvals')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`設定承認の更新に失敗しました: ${error.message}`);
    }

    return result;
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
    const { data: result, error } = await this.supabase
      .from('notification_deliveries')
      .insert({
        template_id: data.template_id,
        recipient_email: data.recipient_email,
        recipient_name: data.recipient_name,
        subject: data.subject,
        body: data.body,
        delivery_status: data.delivery_status,
        sent_at: data.sent_at,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`通知配信履歴の作成に失敗しました: ${error.message}`);
    }

    return result;
  }
}
