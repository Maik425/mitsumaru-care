-- Positions management schema

-- 役職マスターテーブル
CREATE TABLE positions (
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

-- 職員役職関連テーブル
CREATE TABLE user_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, position_id)
);

-- インデックス作成
CREATE INDEX idx_positions_facility_id ON positions(facility_id);
CREATE INDEX idx_positions_level ON positions(level);
CREATE INDEX idx_user_positions_user_id ON user_positions(user_id);
CREATE INDEX idx_user_positions_position_id ON user_positions(position_id);

-- RLSポリシー
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_positions ENABLE ROW LEVEL SECURITY;

-- 役職テーブルのRLSポリシー
CREATE POLICY "Users can view positions from their facility" ON positions
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility admins can manage positions from their facility" ON positions
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role = 'facility_admin'
    )
  );

CREATE POLICY "System admins can manage all positions" ON positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- 職員役職テーブルのRLSポリシー
CREATE POLICY "Users can view their own positions" ON user_positions
  FOR SELECT USING (user_id = auth.uid());

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

CREATE POLICY "System admins can manage all user positions" ON user_positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- ダミーデータ
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
  ('一般職員', '一般の職員', 3, 'bg-gray-100 text-gray-800', '550e8400-e29b-41d4-a716-446655440001');
