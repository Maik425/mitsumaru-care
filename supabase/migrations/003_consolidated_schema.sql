-- 統合スキーママイグレーション
-- 既存のテーブル構造に合わせて整合性を保つ

-- 既存のテーブル構造を確認して、不足しているテーブルのみを作成

-- 役職管理テーブル（positions）
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
  color_code VARCHAR(50),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 職員役職関連テーブル（user_positions）
CREATE TABLE IF NOT EXISTS user_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, position_id)
);

-- 技能管理テーブル（skills）
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 職種・配置ルール管理テーブル（job_rules）
CREATE TABLE IF NOT EXISTS job_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  required_positions UUID[] DEFAULT '{}',
  required_skills UUID[] DEFAULT '{}',
  min_staff_count INTEGER DEFAULT 1,
  max_staff_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- データエクスポート管理テーブル（export_settings）は既存の構造を使用

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_positions_facility_id ON positions(facility_id);
CREATE INDEX IF NOT EXISTS idx_positions_level ON positions(level);
CREATE INDEX IF NOT EXISTS idx_user_positions_user_id ON user_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_positions_position_id ON user_positions(position_id);
CREATE INDEX IF NOT EXISTS idx_skills_facility_id ON skills(facility_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_job_rules_facility_id ON job_rules(facility_id);
-- export_settingsのインデックスは既存の構造を使用

-- RLSポリシー有効化
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_settings ENABLE ROW LEVEL SECURITY;

-- 役職テーブルのRLSポリシー
DROP POLICY IF EXISTS "Users can view positions from their facility" ON positions;
CREATE POLICY "Users can view positions from their facility" ON positions
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Facility admins can manage positions from their facility" ON positions;
CREATE POLICY "Facility admins can manage positions from their facility" ON positions
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role = 'facility_admin'
    )
  );

DROP POLICY IF EXISTS "System admins can manage all positions" ON positions;
CREATE POLICY "System admins can manage all positions" ON positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- 職員役職テーブルのRLSポリシー
DROP POLICY IF EXISTS "Users can view their own positions" ON user_positions;
CREATE POLICY "Users can view their own positions" ON user_positions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Facility admins can manage user positions from their facility" ON user_positions;
CREATE POLICY "Facility admins can manage user positions from their facility" ON user_positions
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users 
      WHERE facility_id IN (
        SELECT facility_id FROM users 
        WHERE id = auth.uid() AND role = 'facility_admin'
      )
    )
  );

DROP POLICY IF EXISTS "System admins can manage all user positions" ON user_positions;
CREATE POLICY "System admins can manage all user positions" ON user_positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- 技能テーブルのRLSポリシー
DROP POLICY IF EXISTS "Users can view skills from their facility" ON skills;
CREATE POLICY "Users can view skills from their facility" ON skills
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Facility admins can manage skills from their facility" ON skills;
CREATE POLICY "Facility admins can manage skills from their facility" ON skills
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role = 'facility_admin'
    )
  );

DROP POLICY IF EXISTS "System admins can manage all skills" ON skills;
CREATE POLICY "System admins can manage all skills" ON skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- 職種・配置ルールテーブルのRLSポリシー
DROP POLICY IF EXISTS "Users can view job rules from their facility" ON job_rules;
CREATE POLICY "Users can view job rules from their facility" ON job_rules
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Facility admins can manage job rules from their facility" ON job_rules;
CREATE POLICY "Facility admins can manage job rules from their facility" ON job_rules
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role = 'facility_admin'
    )
  );

DROP POLICY IF EXISTS "System admins can manage all job rules" ON job_rules;
CREATE POLICY "System admins can manage all job rules" ON job_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- export_settingsのRLSポリシーは既存の構造を使用

-- 更新日時の自動更新トリガー
DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_positions_updated_at ON user_positions;
CREATE TRIGGER update_user_positions_updated_at BEFORE UPDATE ON user_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_rules_updated_at ON job_rules;
CREATE TRIGGER update_job_rules_updated_at BEFORE UPDATE ON job_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- export_settingsのトリガーは既存の構造を使用

-- ダミーデータの挿入（既存データがない場合のみ）
INSERT INTO positions (name, description, level, color_code, facility_id) VALUES
  ('施設長', '施設の最高責任者', 10, 'bg-red-100 text-red-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('副施設長', '施設長を補佐する役職', 9, 'bg-orange-100 text-orange-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('主任', '各部門の主任職', 8, 'bg-yellow-100 text-yellow-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('副主任', '主任を補佐する役職', 7, 'bg-green-100 text-green-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('リーダー', 'チームリーダー職', 6, 'bg-blue-100 text-blue-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('介護福祉士', '介護福祉士資格を持つ職員', 5, 'bg-indigo-100 text-indigo-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('介護士', '介護士資格を持つ職員', 4, 'bg-purple-100 text-purple-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('看護師', '看護師資格を持つ職員', 5, 'bg-pink-100 text-pink-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('相談員', '生活相談員', 4, 'bg-teal-100 text-teal-800', '550e8400-e29b-41d4-a716-446655440001'),
  ('一般職員', '一般の職員', 3, 'bg-gray-100 text-gray-800', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, description, category, facility_id) VALUES
  ('介護技術', '基本的な介護技術', '技術', '550e8400-e29b-41d4-a716-446655440001'),
  ('コミュニケーション', '利用者とのコミュニケーション技術', 'ソフトスキル', '550e8400-e29b-41d4-a716-446655440001'),
  ('医療知識', '基本的な医療知識', '知識', '550e8400-e29b-41d4-a716-446655440001'),
  ('安全管理', '安全な介護の実施', '安全', '550e8400-e29b-41d4-a716-446655440001'),
  ('記録管理', '介護記録の作成・管理', '管理', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

INSERT INTO job_rules (name, description, facility_id, min_staff_count, max_staff_count) VALUES
  ('日勤ルール', '日勤時の人員配置ルール', '550e8400-e29b-41d4-a716-446655440001', 3, 5),
  ('夜勤ルール', '夜勤時の人員配置ルール', '550e8400-e29b-41d4-a716-446655440001', 2, 3),
  ('休日ルール', '休日時の人員配置ルール', '550e8400-e29b-41d4-a716-446655440001', 2, 4)
ON CONFLICT DO NOTHING;

-- export_settingsのダミーデータは既存の構造に合わせてスキップ
