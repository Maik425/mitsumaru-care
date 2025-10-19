import { z } from 'zod';

// システム設定のDTO
export const SystemSettingDto = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.string().nullable(),
  category: z.string(),
  description: z.string().nullable(),
  is_encrypted: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSystemSettingDto = z.object({
  key: z.string().min(1, 'キーを入力してください'),
  value: z.string().nullable(),
  category: z.string().min(1, 'カテゴリを入力してください'),
  description: z.string().nullable(),
  is_encrypted: z.boolean().default(false),
});

export const UpdateSystemSettingDto = z.object({
  value: z.string().nullable(),
  description: z.string().nullable(),
});

// 通知設定のDTO
export const NotificationSettingDto = z.object({
  id: z.string().uuid(),
  notification_type: z.string(),
  is_enabled: z.boolean(),
  template_id: z.string().uuid().nullable(),
  delivery_method: z.string(),
  schedule_config: z.record(z.any()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateNotificationSettingDto = z.object({
  notification_type: z.string().min(1, '通知タイプを入力してください'),
  is_enabled: z.boolean().default(true),
  template_id: z.string().uuid().nullable(),
  delivery_method: z.string().min(1, '配信方法を入力してください'),
  schedule_config: z.record(z.any()).nullable(),
});

export const UpdateNotificationSettingDto = z.object({
  is_enabled: z.boolean(),
  template_id: z.string().uuid().nullable(),
  schedule_config: z.record(z.any()).nullable(),
});

// 通知テンプレートのDTO
export const NotificationTemplateDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  subject: z.string().nullable(),
  body: z.string(),
  template_type: z.string(),
  variables: z.array(z.string()).nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateNotificationTemplateDto = z.object({
  name: z.string().min(1, 'テンプレート名を入力してください'),
  subject: z.string().nullable(),
  body: z.string().min(1, '本文を入力してください'),
  template_type: z.string().min(1, 'テンプレートタイプを入力してください'),
  variables: z.array(z.string()).optional().default([]),
  is_active: z.boolean().default(true),
});

export const UpdateNotificationTemplateDto = z.object({
  name: z.string().min(1, 'テンプレート名を入力してください'),
  subject: z.string().nullable(),
  body: z.string().min(1, '本文を入力してください'),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean(),
});

// セキュリティ設定のDTO
export const SecuritySettingDto = z.object({
  id: z.string().uuid(),
  setting_key: z.string(),
  value: z.string().nullable(),
  setting_type: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSecuritySettingDto = z.object({
  setting_key: z.string().min(1, '設定キーを入力してください'),
  value: z.string().nullable(),
  setting_type: z.string().min(1, '設定タイプを入力してください'),
  description: z.string().nullable(),
  is_active: z.boolean().default(true),
});

export const UpdateSecuritySettingDto = z.object({
  value: z.string().nullable(),
  description: z.string().nullable(),
});

// 設定変更履歴のDTO
export const SettingChangeHistoryDto = z.object({
  id: z.string().uuid(),
  setting_type: z.string(),
  setting_key: z.string(),
  old_value: z.string().nullable(),
  new_value: z.string().nullable(),
  changed_by: z.string().uuid().nullable(),
  change_reason: z.string().nullable(),
  approval_status: z.string(),
  approved_by: z.string().uuid().nullable(),
  approved_at: z.string().nullable(),
  created_at: z.string(),
});

export const CreateSettingChangeHistoryDto = z.object({
  setting_type: z.string().min(1, '設定タイプを入力してください'),
  setting_key: z.string().min(1, '設定キーを入力してください'),
  old_value: z.string().nullable(),
  new_value: z.string().nullable(),
  changed_by: z.string().uuid().nullable(),
  change_reason: z.string().nullable(),
});

// 設定承認のDTO
export const SettingApprovalDto = z.object({
  id: z.string().uuid(),
  change_history_id: z.string().uuid(),
  approver_id: z.string().uuid(),
  approval_status: z.string(),
  approval_comment: z.string().nullable(),
  created_at: z.string(),
});

export const CreateSettingApprovalDto = z.object({
  change_history_id: z.string().uuid(),
  approver_id: z.string().uuid(),
  approval_status: z.string().min(1, '承認ステータスを入力してください'),
  approval_comment: z.string().nullable(),
});

// 型のエクスポート
export type SystemSetting = z.infer<typeof SystemSettingDto>;
export type CreateSystemSetting = z.infer<typeof CreateSystemSettingDto>;
export type UpdateSystemSetting = z.infer<typeof UpdateSystemSettingDto>;

export type NotificationSetting = z.infer<typeof NotificationSettingDto>;
export type CreateNotificationSetting = z.infer<
  typeof CreateNotificationSettingDto
>;
export type UpdateNotificationSetting = z.infer<
  typeof UpdateNotificationSettingDto
>;

export type NotificationTemplate = z.infer<typeof NotificationTemplateDto>;
export type CreateNotificationTemplate = z.infer<
  typeof CreateNotificationTemplateDto
>;
export type UpdateNotificationTemplate = z.infer<
  typeof UpdateNotificationTemplateDto
>;

export type SecuritySetting = z.infer<typeof SecuritySettingDto>;
export type CreateSecuritySetting = z.infer<typeof CreateSecuritySettingDto>;
export type UpdateSecuritySetting = z.infer<typeof UpdateSecuritySettingDto>;

export type SettingChangeHistory = z.infer<typeof SettingChangeHistoryDto>;
export type CreateSettingChangeHistory = z.infer<
  typeof CreateSettingChangeHistoryDto
>;

export type SettingApproval = z.infer<typeof SettingApprovalDto>;
export type CreateSettingApproval = z.infer<typeof CreateSettingApprovalDto>;
