-- Job rules management schema

-- 業務種別テーブル
CREATE TABLE job_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- エリアテーブル
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 配置ルールテンプレートテーブル
CREATE TABLE job_rule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 配置ルールセットテーブル
CREATE TABLE job_rule_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES job_rule_templates(id) ON DELETE CASCADE,
  job_type_id UUID REFERENCES job_types(id) ON DELETE CASCADE,
  area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
  required_skills UUID[] DEFAULT '{}',
  required_positions UUID[] DEFAULT '{}',
  min_staff_count INTEGER NOT NULL DEFAULT 1,
  max_staff_count INTEGER NOT NULL DEFAULT 10,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_job_types_facility_id ON job_types(facility_id);
CREATE INDEX idx_areas_facility_id ON areas(facility_id);
CREATE INDEX idx_job_rule_templates_facility_id ON job_rule_templates(facility_id);
CREATE INDEX idx_job_rule_sets_template_id ON job_rule_sets(template_id);
CREATE INDEX idx_job_rule_sets_job_type_id ON job_rule_sets(job_type_id);
CREATE INDEX idx_job_rule_sets_area_id ON job_rule_sets(area_id);

-- RLSポリシー
ALTER TABLE job_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_rule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_rule_sets ENABLE ROW LEVEL SECURITY;

-- 業務種別テーブルのRLSポリシー
CREATE POLICY "Users can view job types from their facility" ON job_types
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility admins can manage job types from their facility" ON job_types
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role = 'facility_admin'
    )
  );

CREATE POLICY "System admins can manage all job types" ON job_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- エリアテーブルのRLSポリシー
CREATE POLICY "Users can view areas from their facility" ON areas
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility admins can manage areas from their facility" ON areas
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role = 'facility_admin'
    )
  );

CREATE POLICY "System admins can manage all areas" ON areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- 配置ルールテンプレートテーブルのRLSポリシー
CREATE POLICY "Users can view job rule templates from their facility" ON job_rule_templates
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility admins can manage job rule templates from their facility" ON job_rule_templates
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role = 'facility_admin'
    )
  );

CREATE POLICY "System admins can manage all job rule templates" ON job_rule_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- 配置ルールセットテーブルのRLSポリシー
CREATE POLICY "Users can view job rule sets from their facility" ON job_rule_sets
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM job_rule_templates 
      WHERE facility_id IN (
        SELECT facility_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Facility admins can manage job rule sets from their facility" ON job_rule_sets
  FOR ALL USING (
    template_id IN (
      SELECT id FROM job_rule_templates 
      WHERE facility_id IN (
        SELECT facility_id FROM users 
        WHERE id = auth.uid() AND role = 'facility_admin'
      )
    )
  );

CREATE POLICY "System admins can manage all job rule sets" ON job_rule_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ダミーデータ
INSERT INTO job_types (name, description, facility_id) VALUES
  ('身体介護', '身体的な介護業務', '550e8400-e29b-41d4-a716-446655440001'),
  ('生活援助', '日常生活の援助業務', '550e8400-e29b-41d4-a716-446655440001'),
  ('医療処置', '医療的な処置業務', '550e8400-e29b-41d4-a716-446655440001'),
  ('相談業務', '利用者・家族への相談業務', '550e8400-e29b-41d4-a716-446655440001'),
  ('管理業務', '施設運営に関する管理業務', '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO areas (name, description, facility_id) VALUES
  ('1階フロア', '1階の利用者エリア', '550e8400-e29b-41d4-a716-446655440001'),
  ('2階フロア', '2階の利用者エリア', '550e8400-e29b-41d4-a716-446655440001'),
  ('3階フロア', '3階の利用者エリア', '550e8400-e29b-41d4-a716-446655440001'),
  ('リハビリ室', 'リハビリテーション室', '550e8400-e29b-41d4-a716-446655440001'),
  ('相談室', '生活相談室', '550e8400-e29b-41d4-a716-446655440001'),
  ('事務所', '事務・管理エリア', '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO job_rule_templates (name, description, facility_id) VALUES
  ('基本配置ルール', '基本的な職員配置ルール', '550e8400-e29b-41d4-a716-446655440001'),
  ('夜勤配置ルール', '夜勤時の職員配置ルール', '550e8400-e29b-41d4-a716-446655440001'),
  ('休日配置ルール', '休日時の職員配置ルール', '550e8400-e29b-41d4-a716-446655440001');
