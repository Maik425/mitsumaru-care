-- システム設定管理用テーブルの作成
-- マイグレーション: 002_system_settings_schema.sql

-- システム設定テーブル
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_type VARCHAR(50) NOT NULL DEFAULT 'string',
    value TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知設定テーブル
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type VARCHAR(100) NOT NULL UNIQUE,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    template_id UUID,
    schedule_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知テンプレートテーブル
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- セキュリティ設定テーブル
CREATE TABLE IF NOT EXISTS security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_type VARCHAR(50) NOT NULL DEFAULT 'string',
    value TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 設定変更履歴テーブル
CREATE TABLE IF NOT EXISTS setting_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_type VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 設定承認テーブル
CREATE TABLE IF NOT EXISTS setting_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_history_id UUID REFERENCES setting_change_history(id),
    approval_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approver_id UUID REFERENCES users(id),
    approval_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知配信履歴テーブル
CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES notification_templates(id),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_notification_settings_type ON notification_settings(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_security_settings_key ON security_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_setting_change_history_key ON setting_change_history(setting_key);
CREATE INDEX IF NOT EXISTS idx_setting_change_history_created_at ON setting_change_history(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_created_at ON notification_deliveries(created_at);

-- 初期データの挿入
INSERT INTO system_settings (setting_key, setting_type, value, description) VALUES
('system_name', 'string', 'みつまるケア', 'システム名'),
('system_version', 'string', '1.0.0', 'システムバージョン'),
('maintenance_mode', 'boolean', 'false', 'メンテナンスモード'),
('max_file_size', 'number', '10485760', '最大ファイルサイズ（バイト）'),
('session_timeout', 'number', '3600', 'セッションタイムアウト（秒）')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO notification_settings (notification_type, is_enabled) VALUES
('email_notifications', true),
('system_alerts', true),
('user_registration', false),
('password_reset', true)
ON CONFLICT (notification_type) DO NOTHING;

INSERT INTO notification_templates (name, template_type, subject, body, variables) VALUES
('welcome_email', 'email', '{{system_name}}へようこそ', '{{user_name}}様、{{system_name}}へようこそ。', '["user_name", "system_name"]'),
('password_reset', 'email', 'パスワードリセット', '{{user_name}}様、パスワードリセットのご依頼を受け付けました。', '["user_name", "reset_link"]'),
('system_alert', 'email', 'システムアラート', '{{alert_message}}', '["alert_message"]')
ON CONFLICT DO NOTHING;

INSERT INTO security_settings (setting_key, setting_type, value, description) VALUES
('password_min_length', 'number', '8', 'パスワード最小文字数'),
('password_require_uppercase', 'boolean', 'true', 'パスワードに大文字を含む'),
('password_require_lowercase', 'boolean', 'true', 'パスワードに小文字を含む'),
('password_require_numbers', 'boolean', 'true', 'パスワードに数字を含む'),
('password_require_symbols', 'boolean', 'false', 'パスワードに記号を含む'),
('session_timeout_minutes', 'number', '60', 'セッションタイムアウト（分）'),
('max_login_attempts', 'number', '5', '最大ログイン試行回数'),
('ip_whitelist_enabled', 'boolean', 'false', 'IPホワイトリスト有効化')
ON CONFLICT (setting_key) DO NOTHING;

-- RLSポリシーの設定
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE setting_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE setting_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

-- システム管理者のみアクセス可能
CREATE POLICY "system_admin_only_system_settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'system_admin'
        )
    );

CREATE POLICY "system_admin_only_notification_settings" ON notification_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'system_admin'
        )
    );

CREATE POLICY "system_admin_only_notification_templates" ON notification_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'system_admin'
        )
    );

CREATE POLICY "system_admin_only_security_settings" ON security_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'system_admin'
        )
    );

CREATE POLICY "system_admin_only_setting_change_history" ON setting_change_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'system_admin'
        )
    );

CREATE POLICY "system_admin_only_setting_approvals" ON setting_approvals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'system_admin'
        )
    );

CREATE POLICY "system_admin_only_notification_deliveries" ON notification_deliveries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'system_admin'
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

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON security_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_setting_approvals_updated_at BEFORE UPDATE ON setting_approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();