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

-- 最初の日付でソートしやすくするためのインデックス
CREATE INDEX holiday_requests_first_date_idx
  ON holiday_requests ( (dates[1]) );

-- RLS設定
ALTER TABLE holiday_requests ENABLE ROW LEVEL SECURITY;

-- 自分の申請のみ参照可能
CREATE POLICY holiday_requests_select_self ON holiday_requests
  FOR SELECT TO public
  USING (user_id = auth.uid()::uuid);

-- 自分の申請のみ作成可能
CREATE POLICY holiday_requests_insert_self ON holiday_requests
  FOR INSERT TO public
  WITH CHECK (user_id = auth.uid()::uuid);

-- 自分の申請の更新を許可（却下理由などは管理者側で後日対応予定）
CREATE POLICY holiday_requests_update_self ON holiday_requests
  FOR UPDATE TO public
  USING (user_id = auth.uid()::uuid)
  WITH CHECK (user_id = auth.uid()::uuid);

-- service_roleは全操作可能
CREATE POLICY holiday_requests_service_role_all ON holiday_requests
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- updated_at自動更新
CREATE TRIGGER update_holiday_requests_updated_at
  BEFORE UPDATE ON holiday_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 申請履歴ダミーデータ
INSERT INTO holiday_requests (user_id, type, dates, status, reason)
VALUES
  ('00000000-0000-0000-0000-000000000004', 'regular', ARRAY['2025-10-15']::date[], 'approved', NULL),
  ('00000000-0000-0000-0000-000000000004', 'regular', ARRAY['2025-11-03','2025-11-05']::date[], 'pending', NULL),
  ('00000000-0000-0000-0000-000000000004', 'exchange', ARRAY['2025-10-08']::date[], 'pending', '家族の予定のため');

