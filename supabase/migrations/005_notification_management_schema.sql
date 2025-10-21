-- 通知管理システムのスキーマ
-- 既存のテーブルをリセットして新しいスキーマを作成

-- 既存の通知関連テーブルを削除（存在する場合）
DROP TABLE IF EXISTS notification_deliveries CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;

-- 通知テンプレートテーブル
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'system', 'sms')),
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 通知テーブル
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('system', 'user', 'facility', 'role')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 通知配信テーブル
CREATE TABLE notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(255),
  delivery_type VARCHAR(50) NOT NULL CHECK (delivery_type IN ('email', 'system', 'sms')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知設定テーブル
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  system_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, facility_id, notification_type)
);

-- 通知統計テーブル
CREATE TABLE notification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  bounce_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notifications_created_by ON notifications(created_by);

CREATE INDEX idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX idx_notification_deliveries_recipient_id ON notification_deliveries(recipient_id);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(status);
CREATE INDEX idx_notification_deliveries_delivery_type ON notification_deliveries(delivery_type);

CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX idx_notification_settings_facility_id ON notification_settings(facility_id);

-- RLSポリシーの設定
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_stats ENABLE ROW LEVEL SECURITY;

-- 通知テンプレートのRLSポリシー
CREATE POLICY "システム管理者は通知テンプレートを管理できる" ON notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'system_admin'
    )
  );

-- 通知のRLSポリシー
CREATE POLICY "システム管理者は通知を管理できる" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'system_admin'
    )
  );

-- 通知配信のRLSポリシー
CREATE POLICY "システム管理者は通知配信を管理できる" ON notification_deliveries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'system_admin'
    )
  );

-- ユーザーは自分の通知配信を閲覧できる
CREATE POLICY "ユーザーは自分の通知配信を閲覧できる" ON notification_deliveries
  FOR SELECT USING (recipient_id = auth.uid());

-- 通知設定のRLSポリシー
CREATE POLICY "ユーザーは自分の通知設定を管理できる" ON notification_settings
  FOR ALL USING (user_id = auth.uid());

-- システム管理者は全ユーザーの通知設定を管理できる
CREATE POLICY "システム管理者は全ユーザーの通知設定を管理できる" ON notification_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'system_admin'
    )
  );

-- 通知統計のRLSポリシー
CREATE POLICY "システム管理者は通知統計を閲覧できる" ON notification_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'system_admin'
    )
  );

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_deliveries_updated_at
  BEFORE UPDATE ON notification_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_stats_updated_at
  BEFORE UPDATE ON notification_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ダミーデータの挿入
INSERT INTO notification_templates (name, subject, body, type, variables) VALUES
('システムメンテナンス通知', '【重要】システムメンテナンスのお知らせ', '{{facility_name}}の皆様\n\n{{maintenance_date}}にシステムメンテナンスを実施いたします。\n\nメンテナンス時間: {{maintenance_time}}\n影響範囲: {{affected_services}}\n\nご不便をおかけいたしますが、ご理解のほどよろしくお願いいたします。', 'email', '{"facility_name": "施設名", "maintenance_date": "メンテナンス日", "maintenance_time": "メンテナンス時間", "affected_services": "影響範囲"}'),
('勤務シフト変更通知', '【勤務シフト変更】{{shift_date}}のシフトが変更されました', '{{user_name}}様\n\n{{shift_date}}の勤務シフトが以下のように変更されました。\n\n変更前: {{old_shift}}\n変更後: {{new_shift}}\n\nご確認のほどよろしくお願いいたします。', 'email', '{"user_name": "ユーザー名", "shift_date": "シフト日", "old_shift": "変更前シフト", "new_shift": "変更後シフト"}'),
('緊急連絡', '【緊急】{{title}}', '{{content}}\n\n緊急のため、至急ご確認ください。', 'email', '{"title": "件名", "content": "内容"}'),
('システム内通知', 'システム通知', '{{content}}', 'system', '{"content": "内容"}');

-- 通知設定のデフォルトデータ（ユーザーが存在する場合のみ）
-- INSERT INTO notification_settings (user_id, facility_id, notification_type, email_enabled, system_enabled, sms_enabled)
-- SELECT 
--   u.id,
--   f.id,
--   'system_maintenance',
--   true,
--   true,
--   false
-- FROM users u
-- CROSS JOIN facilities f
-- WHERE u.role IN ('facility_admin', 'user');

-- INSERT INTO notification_settings (user_id, facility_id, notification_type, email_enabled, system_enabled, sms_enabled)
-- SELECT 
--   u.id,
--   f.id,
--   'shift_change',
--   true,
--   true,
--   false
-- FROM users u
-- CROSS JOIN facilities f
-- WHERE u.role IN ('facility_admin', 'user');

-- INSERT INTO notification_settings (user_id, facility_id, notification_type, email_enabled, system_enabled, sms_enabled)
-- SELECT 
--   u.id,
--   f.id,
--   'emergency',
--   true,
--   true,
--   true
-- FROM users u
-- CROSS JOIN facilities f
-- WHERE u.role IN ('facility_admin', 'user');
