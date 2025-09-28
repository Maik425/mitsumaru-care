-- 勤怠管理スキーマ
-- 勤怠記録、申請、シフト管理用のテーブル

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

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_requests_updated_at BEFORE UPDATE ON attendance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_shifts_updated_at BEFORE UPDATE ON user_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) の設定
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shifts ENABLE ROW LEVEL SECURITY;

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

-- ダミーデータの挿入
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
  ('00000000-0000-0000-0000-000000000004', (SELECT id FROM shifts WHERE name = '日勤' AND facility_id = '550e8400-e29b-41d4-a716-446655440001' LIMIT 1), '2024-02-01'),
  ('00000000-0000-0000-0000-000000000005', (SELECT id FROM shifts WHERE name = '早番' AND facility_id = '550e8400-e29b-41d4-a716-446655440002' LIMIT 1), '2024-02-01'),
  ('00000000-0000-0000-0000-000000000006', (SELECT id FROM shifts WHERE name = '遅番' AND facility_id = '550e8400-e29b-41d4-a716-446655440003' LIMIT 1), '2024-02-01');

-- 勤怠記録のダミーデータ
INSERT INTO attendance_records (user_id, date, shift_id, scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time, break_duration, overtime_duration, status, notes) VALUES
  ('00000000-0000-0000-0000-000000000004', '2024-02-01', (SELECT id FROM shifts WHERE name = '日勤' AND facility_id = '550e8400-e29b-41d4-a716-446655440001' LIMIT 1), '09:00', '18:00', '08:55', '18:10', 60, 10, 'approved', ''),
  ('00000000-0000-0000-0000-000000000005', '2024-02-01', (SELECT id FROM shifts WHERE name = '早番' AND facility_id = '550e8400-e29b-41d4-a716-446655440002' LIMIT 1), '07:00', '16:00', '07:05', '16:00', 60, 0, 'pending', '電車遅延のため5分遅刻'),
  ('00000000-0000-0000-0000-000000000006', '2024-02-01', (SELECT id FROM shifts WHERE name = '遅番' AND facility_id = '550e8400-e29b-41d4-a716-446655440003' LIMIT 1), '11:00', '20:00', '10:45', '20:30', 60, 30, 'correction_requested', '緊急対応のため残業');

-- 勤怠申請のダミーデータ
INSERT INTO attendance_requests (user_id, type, target_date, original_start_time, original_end_time, requested_start_time, requested_end_time, reason, status) VALUES
  ('00000000-0000-0000-0000-000000000004', 'clock_correction', '2024-01-30', '09:00', '18:00', '09:00', '18:00', '打刻忘れ', 'pending'),
  ('00000000-0000-0000-0000-000000000005', 'overtime', '2024-01-31', '07:00', '16:00', '07:00', '16:30', '緊急対応', 'pending');
