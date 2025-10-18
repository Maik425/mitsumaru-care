-- 完全なスキーマ統合マイグレーション
-- 認証、勤怠、休暇申請、ビューを全て含む

-- 既存のテーブルを削除（リセット）
DROP VIEW IF EXISTS facility_currently_working_staff;
DROP TABLE IF EXISTS holiday_requests CASCADE;
DROP TABLE IF EXISTS user_shifts CASCADE;
DROP TABLE IF EXISTS attendance_requests CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

-- 更新日時自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ユーザーロール確認関数
CREATE OR REPLACE FUNCTION current_user_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::uuid 
        AND role = role_name::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 現在のユーザーの施設ID取得関数
CREATE OR REPLACE FUNCTION current_user_facility()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT facility_id FROM users 
        WHERE id = auth.uid()::uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 施設テーブル
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('system_admin', 'facility_admin', 'user')),
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- シフトテーブル
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- 日勤、早番、遅番など
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 60, -- 休憩時間（分）
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 勤怠記録テーブル
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  scheduled_start_time TIME,
  scheduled_end_time TIME,
  actual_start_time TIME,
  actual_end_time TIME,
  break_duration INTEGER DEFAULT 60, -- 実際の休憩時間（分）
  overtime_duration INTEGER DEFAULT 0, -- 残業時間（分）
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'correction_requested')),
  notes TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 勤怠申請テーブル
CREATE TABLE attendance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('clock_correction', 'overtime', 'work_time_change')),
  target_date DATE NOT NULL,
  original_start_time TIME,
  original_end_time TIME,
  requested_start_time TIME,
  requested_end_time TIME,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 職員のシフト割り当てテーブル
CREATE TABLE user_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_working BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 希望休・交換希望申請用テーブル
CREATE TABLE holiday_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('regular', 'exchange')),
  dates DATE[] NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  reject_reason TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
CREATE INDEX idx_attendance_requests_user_id ON attendance_requests(user_id);
CREATE INDEX idx_attendance_requests_type ON attendance_requests(type);
CREATE INDEX idx_attendance_requests_status ON attendance_requests(status);
CREATE INDEX idx_user_shifts_user_id ON user_shifts(user_id);
CREATE INDEX idx_user_shifts_date ON user_shifts(date);
CREATE INDEX idx_shifts_facility_id ON shifts(facility_id);
CREATE INDEX holiday_requests_first_date_idx ON holiday_requests ( (dates[1]) );

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_requests_updated_at BEFORE UPDATE ON attendance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_shifts_updated_at BEFORE UPDATE ON user_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holiday_requests_updated_at BEFORE UPDATE ON holiday_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) の設定
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_requests ENABLE ROW LEVEL SECURITY;

-- 施設テーブルのRLSポリシー
CREATE POLICY facilities_select_all ON facilities
  FOR SELECT TO public USING (true);

CREATE POLICY facilities_manage_system_admin ON facilities
  FOR ALL TO public USING (current_user_has_role('system_admin'::text))
  WITH CHECK (current_user_has_role('system_admin'::text));

CREATE POLICY facilities_service_role_all ON facilities
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ユーザーテーブルのRLSポリシー
CREATE POLICY users_select_self ON users
  FOR SELECT TO public USING (id = auth.uid()::uuid);

CREATE POLICY users_select_facility_admin ON users
  FOR SELECT TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND facility_id = current_user_facility())
  );

CREATE POLICY users_manage_system_admin ON users
  FOR ALL TO public USING (current_user_has_role('system_admin'::text))
  WITH CHECK (current_user_has_role('system_admin'::text));

CREATE POLICY users_manage_facility_admin ON users
  FOR ALL TO public USING (
    current_user_has_role('facility_admin'::text) AND facility_id = current_user_facility()
  )
  WITH CHECK (
    current_user_has_role('facility_admin'::text) AND facility_id = current_user_facility()
  );

CREATE POLICY users_service_role_all ON users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- シフトテーブルのRLSポリシー
CREATE POLICY shifts_select_facility ON shifts
  FOR SELECT TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND facility_id = current_user_facility()) OR
    (current_user_has_role('user'::text) AND facility_id = current_user_facility())
  );

CREATE POLICY shifts_manage_facility_admin ON shifts
  FOR ALL TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND facility_id = current_user_facility())
  )
  WITH CHECK (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND facility_id = current_user_facility())
  );

CREATE POLICY shifts_service_role_all ON shifts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 勤怠記録テーブルのRLSポリシー
CREATE POLICY attendance_records_select_self ON attendance_records
  FOR SELECT TO public USING (user_id = auth.uid()::uuid);

CREATE POLICY attendance_records_select_facility_admin ON attendance_records
  FOR SELECT TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = attendance_records.user_id AND u.facility_id = current_user_facility()))
  );

CREATE POLICY attendance_records_insert_self ON attendance_records
  FOR INSERT TO public WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY attendance_records_update_facility_admin ON attendance_records
  FOR UPDATE TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = attendance_records.user_id AND u.facility_id = current_user_facility()))
  )
  WITH CHECK (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = attendance_records.user_id AND u.facility_id = current_user_facility()))
  );

CREATE POLICY attendance_records_service_role_all ON attendance_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 勤怠申請テーブルのRLSポリシー
CREATE POLICY attendance_requests_select_self ON attendance_requests
  FOR SELECT TO public USING (user_id = auth.uid()::uuid);

CREATE POLICY attendance_requests_select_facility_admin ON attendance_requests
  FOR SELECT TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = attendance_requests.user_id AND u.facility_id = current_user_facility()))
  );

CREATE POLICY attendance_requests_insert_self ON attendance_requests
  FOR INSERT TO public WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY attendance_requests_update_facility_admin ON attendance_requests
  FOR UPDATE TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = attendance_requests.user_id AND u.facility_id = current_user_facility()))
  )
  WITH CHECK (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = attendance_requests.user_id AND u.facility_id = current_user_facility()))
  );

CREATE POLICY attendance_requests_service_role_all ON attendance_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ユーザーシフトテーブルのRLSポリシー
CREATE POLICY user_shifts_select_self ON user_shifts
  FOR SELECT TO public USING (user_id = auth.uid()::uuid);

CREATE POLICY user_shifts_select_facility_admin ON user_shifts
  FOR SELECT TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = user_shifts.user_id AND u.facility_id = current_user_facility()))
  );

CREATE POLICY user_shifts_manage_facility_admin ON user_shifts
  FOR ALL TO public USING (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = user_shifts.user_id AND u.facility_id = current_user_facility()))
  )
  WITH CHECK (
    current_user_has_role('system_admin'::text) OR
    (current_user_has_role('facility_admin'::text) AND 
     EXISTS (SELECT 1 FROM users u WHERE u.id = user_shifts.user_id AND u.facility_id = current_user_facility()))
  );

CREATE POLICY user_shifts_service_role_all ON user_shifts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 休暇申請テーブルのRLSポリシー
CREATE POLICY holiday_requests_select_self ON holiday_requests
  FOR SELECT TO public
  USING (user_id = auth.uid()::uuid);

CREATE POLICY holiday_requests_insert_self ON holiday_requests
  FOR INSERT TO public
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY holiday_requests_update_self ON holiday_requests
  FOR UPDATE TO public
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY holiday_requests_service_role_all ON holiday_requests
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 勤務中職員ビュー
CREATE OR REPLACE VIEW facility_currently_working_staff AS
SELECT
  ar.id AS attendance_record_id,
  ar.user_id,
  u.name,
  u.role,
  u.facility_id,
  ar.date,
  ar.actual_start_time,
  ar.scheduled_end_time,
  ar.break_duration,
  s.name AS shift_name,
  s.start_time AS shift_start_time,
  s.end_time AS shift_end_time
FROM attendance_records ar
JOIN users u ON u.id = ar.user_id
LEFT JOIN shifts s ON s.id = ar.shift_id
WHERE ar.actual_start_time IS NOT NULL
  AND ar.actual_end_time IS NULL;

GRANT SELECT ON facility_currently_working_staff TO authenticated;
GRANT SELECT ON facility_currently_working_staff TO service_role;

-- ダミーデータの挿入
-- 施設データ
INSERT INTO facilities (id, name, address, phone, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'みつまるケア 本店', '東京都渋谷区恵比寿1-1-1', '03-1234-5678', 'main@mitsumaru-care.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'みつまるケア 分店', '東京都新宿区新宿2-2-2', '03-2345-6789', 'branch@mitsumaru-care.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'みつまるケア 支店', '東京都港区六本木3-3-3', '03-3456-7890', 'sub@mitsumaru-care.com');

-- 注意: 認証ユーザーはSupabaseの管理画面またはAdmin APIで作成してください
-- 以下のコマンドでユーザーを作成できます：
-- 
-- curl -X POST 'https://your-project.supabase.co/auth/v1/admin/users' \
--   -H "apikey: YOUR_SERVICE_ROLE_KEY" \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{
--     "email": "admin@mitsumaru-care.com",
--     "password": "password123",
--     "email_confirm": true
--   }'

-- ユーザーデータ（実際に作成された認証ユーザーIDを使用）
INSERT INTO users (id, email, name, role, facility_id) VALUES
  ('b9866da3-c6fa-40a5-a02a-89b303a162e2', 'admin@mitsumaru-care.com', 'システム管理者', 'system_admin', NULL),
  ('a3466255-df5e-4503-a9d7-c1c618657d65', 'facility1@mitsumaru-care.com', '施設管理者1', 'facility_admin', '550e8400-e29b-41d4-a716-446655440001'),
  ('00000000-0000-0000-0000-000000000003', 'facility2@mitsumaru-care.com', '施設管理者2', 'facility_admin', '550e8400-e29b-41d4-a716-446655440002'),
  ('28b050bf-c246-4fd5-ad03-a1247bf90f83', 'user1@mitsumaru-care.com', '職員1', 'user', '550e8400-e29b-41d4-a716-446655440001'),
  ('00000000-0000-0000-0000-000000000005', 'user2@mitsumaru-care.com', '職員2', 'user', '550e8400-e29b-41d4-a716-446655440002'),
  ('00000000-0000-0000-0000-000000000006', 'user3@mitsumaru-care.com', '職員3', 'user', '550e8400-e29b-41d4-a716-446655440003');

-- シフトデータ
INSERT INTO shifts (name, start_time, end_time, break_duration, facility_id) VALUES
  ('日勤', '09:00', '18:00', 60, '550e8400-e29b-41d4-a716-446655440001'),
  ('早番', '07:00', '16:00', 60, '550e8400-e29b-41d4-a716-446655440001'),
  ('遅番', '11:00', '20:00', 60, '550e8400-e29b-41d4-a716-446655440001'),
  ('夜勤', '22:00', '08:00', 60, '550e8400-e29b-41d4-a716-446655440001'),
  ('日勤', '09:00', '18:00', 60, '550e8400-e29b-41d4-a716-446655440002'),
  ('早番', '07:00', '16:00', 60, '550e8400-e29b-41d4-a716-446655440002'),
  ('遅番', '11:00', '20:00', 60, '550e8400-e29b-41d4-a716-446655440002'),
  ('日勤', '09:00', '18:00', 60, '550e8400-e29b-41d4-a716-446655440003'),
  ('早番', '07:00', '16:00', 60, '550e8400-e29b-41d4-a716-446655440003'),
  ('遅番', '11:00', '20:00', 60, '550e8400-e29b-41d4-a716-446655440003');

-- 職員のシフト割り当て（2024年2月1日）
INSERT INTO user_shifts (user_id, shift_id, date) VALUES
  ('28b050bf-c246-4fd5-ad03-a1247bf90f83', (SELECT id FROM shifts WHERE name = '日勤' AND facility_id = '550e8400-e29b-41d4-a716-446655440001' LIMIT 1), '2024-02-01'),
  ('00000000-0000-0000-0000-000000000005', (SELECT id FROM shifts WHERE name = '早番' AND facility_id = '550e8400-e29b-41d4-a716-446655440002' LIMIT 1), '2024-02-01'),
  ('00000000-0000-0000-0000-000000000006', (SELECT id FROM shifts WHERE name = '遅番' AND facility_id = '550e8400-e29b-41d4-a716-446655440003' LIMIT 1), '2024-02-01');

-- 勤怠記録のダミーデータ
INSERT INTO attendance_records (user_id, date, shift_id, scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time, break_duration, overtime_duration, status, notes) VALUES
  ('28b050bf-c246-4fd5-ad03-a1247bf90f83', '2024-02-01', (SELECT id FROM shifts WHERE name = '日勤' AND facility_id = '550e8400-e29b-41d4-a716-446655440001' LIMIT 1), '09:00', '18:00', '08:55', '18:10', 60, 10, 'approved', ''),
  ('00000000-0000-0000-0000-000000000005', '2024-02-01', (SELECT id FROM shifts WHERE name = '早番' AND facility_id = '550e8400-e29b-41d4-a716-446655440002' LIMIT 1), '07:00', '16:00', '07:05', '16:00', 60, 0, 'pending', '電車遅延のため5分遅刻'),
  ('00000000-0000-0000-0000-000000000006', '2024-02-01', (SELECT id FROM shifts WHERE name = '遅番' AND facility_id = '550e8400-e29b-41d4-a716-446655440003' LIMIT 1), '11:00', '20:00', '10:45', '20:30', 60, 30, 'correction_requested', '緊急対応のため残業');

-- 勤怠申請のダミーデータ
INSERT INTO attendance_requests (user_id, type, target_date, original_start_time, original_end_time, requested_start_time, requested_end_time, reason, status) VALUES
  ('28b050bf-c246-4fd5-ad03-a1247bf90f83', 'clock_correction', '2024-01-30', '09:00', '18:00', '09:00', '18:00', '打刻忘れ', 'pending'),
  ('00000000-0000-0000-0000-000000000005', 'overtime', '2024-01-31', '07:00', '16:00', '07:00', '16:30', '緊急対応', 'pending');

-- 申請履歴ダミーデータ
INSERT INTO holiday_requests (user_id, type, dates, status, reason)
VALUES
  ('28b050bf-c246-4fd5-ad03-a1247bf90f83', 'regular', ARRAY['2025-10-15']::date[], 'approved', NULL),
  ('28b050bf-c246-4fd5-ad03-a1247bf90f83', 'regular', ARRAY['2025-11-03','2025-11-05']::date[], 'pending', NULL),
  ('28b050bf-c246-4fd5-ad03-a1247bf90f83', 'exchange', ARRAY['2025-10-08']::date[], 'pending', '家族の予定のため');
