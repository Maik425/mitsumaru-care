-- Skills management schema

-- 技能マスターテーブル
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  description TEXT,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 職員技能関連テーブル
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  experience_years INTEGER NOT NULL DEFAULT 0,
  certified BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- インデックス作成
CREATE INDEX idx_skills_facility_id ON skills(facility_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);

-- RLSポリシー
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- 技能テーブルのRLSポリシー
CREATE POLICY "Users can view skills from their facility" ON skills
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility admins can manage skills from their facility" ON skills
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role = 'facility_admin'
    )
  );

CREATE POLICY "System admins can manage all skills" ON skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- 職員技能テーブルのRLSポリシー
CREATE POLICY "Users can view their own skills" ON user_skills
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Facility admins can manage user skills from their facility" ON user_skills
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users 
      WHERE facility_id IN (
        SELECT facility_id FROM users 
        WHERE id = auth.uid() AND role = 'facility_admin'
      )
    )
  );

CREATE POLICY "System admins can manage all user skills" ON user_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ダミーデータ
INSERT INTO skills (name, category, level, description, facility_id) VALUES
  ('身体介護', '身体介護', 3, '基本的な身体介護技術', '550e8400-e29b-41d4-a716-446655440001'),
  ('生活援助', '生活援助', 2, '日常生活の援助技術', '550e8400-e29b-41d4-a716-446655440001'),
  ('医療処置', '医療処置', 4, '医療的な処置技術', '550e8400-e29b-41d4-a716-446655440001'),
  ('相談業務', '相談業務', 3, '利用者・家族への相談対応', '550e8400-e29b-41d4-a716-446655440001'),
  ('管理業務', '管理業務', 4, '施設運営に関する管理業務', '550e8400-e29b-41d4-a716-446655440001'),
  ('リハビリ', 'リハビリ', 3, 'リハビリテーション技術', '550e8400-e29b-41d4-a716-446655440001'),
  ('認知症ケア', '認知症ケア', 3, '認知症利用者への専門的ケア', '550e8400-e29b-41d4-a716-446655440001'),
  ('緊急対応', '緊急対応', 4, '緊急時の対応技術', '550e8400-e29b-41d4-a716-446655440001');
