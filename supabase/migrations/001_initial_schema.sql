-- 初期スキーマとダミーデータ
-- 完全なリセットとセットアップ

-- 既存のテーブルとデータを削除（安全なリセット）
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 権限の再付与（Supabaseのデフォルトロール）
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT CREATE ON SCHEMA public TO postgres, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
-- Authenticationユーザーをリセット
DELETE FROM auth.users;

-- 施設テーブル
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザーテーブル（auth.usersを参照）
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('system_admin', 'facility_admin', 'user')),
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS内で利用する権限チェック用関数（SECURITY DEFINERで再帰を回避）
CREATE OR REPLACE FUNCTION public.current_user_has_role(target_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
  active boolean;
BEGIN
  SELECT role, is_active
    INTO current_role, active
  FROM public.users
  WHERE id = auth.uid();

  RETURN coalesce(active, false) AND current_role = target_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_facility()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  facility uuid;
BEGIN
  SELECT facility_id
    INTO facility
  FROM public.users
  WHERE id = auth.uid();

  RETURN facility;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_has_role(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_facility() TO anon, authenticated, service_role;

-- インデックス作成
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_facility_id ON users(facility_id);
CREATE INDEX idx_facilities_name ON facilities(name);

-- RLS (Row Level Security) の設定
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 施設テーブルのRLSポリシー
CREATE POLICY facilities_select_all ON facilities
  FOR SELECT USING (true);

CREATE POLICY facilities_manage_system_admin ON facilities
  FOR ALL USING (public.current_user_has_role('system_admin'));

-- ユーザーテーブルのRLSポリシー
CREATE POLICY users_select_self ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_select_system_admin ON users
  FOR SELECT USING (public.current_user_has_role('system_admin'));

CREATE POLICY users_select_facility_admin ON users
  FOR SELECT USING (
    public.current_user_has_role('facility_admin')
    AND facility_id IS NOT DISTINCT FROM public.current_user_facility()
  );

CREATE POLICY users_manage_system_admin ON users
  FOR ALL USING (public.current_user_has_role('system_admin'));

-- 認証済みユーザー情報取得用RPC
CREATE OR REPLACE FUNCTION public_get_current_user_with_email(target_id uuid)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  facility_id UUID,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    au.email::text,
    u.name::text,
    u.role::text,
    u.facility_id,
    u.is_active,
    u.created_at,
    u.updated_at
  FROM public.users u
  JOIN auth.users au ON au.id = u.id
  WHERE u.id = target_id
    AND (
      target_id = auth.uid()
      OR public.current_user_has_role('system_admin')
      OR (
        public.current_user_has_role('facility_admin')
        AND u.facility_id IS NOT DISTINCT FROM public.current_user_facility()
      )
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public_get_current_user_with_email(uuid) TO authenticated, service_role;

-- ダミーデータの挿入
-- 施設データ
INSERT INTO facilities (id, name, address, phone, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'みつまるケア 本店', '東京都渋谷区恵比寿1-1-1', '03-1234-5678', 'main@mitsumaru-care.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'みつまるケア 新宿支店', '東京都新宿区新宿2-2-2', '03-2345-6789', 'shinjuku@mitsumaru-care.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'みつまるケア 池袋支店', '東京都豊島区池袋3-3-3', '03-3456-7890', 'ikebukuro@mitsumaru-care.com');

-- Supabase Authenticationにダミーユーザーを追加
-- システム管理者
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'system@mitsumaru.com',
  crypt('asdfasdf', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 施設管理者（本店）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'facility@mitsumaru.com',
  crypt('asdfasdf', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 施設管理者（新宿）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  'authenticated',
  'authenticated',
  'facility2@mitsumaru.com',
  crypt('asdfasdf', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 一般ユーザー（本店）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000004',
  'authenticated',
  'authenticated',
  'user@mitsumaru.com',
  crypt('asdfasdf', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 一般ユーザー（新宿）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000005',
  'authenticated',
  'authenticated',
  'user2@mitsumaru.com',
  crypt('asdfasdf', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 一般ユーザー（池袋）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000006',
  'authenticated',
  'authenticated',
  'user3@mitsumaru.com',
  crypt('asdfasdf', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- public.usersテーブルにユーザーデータを挿入（emailカラムを削除）
INSERT INTO users (id, name, role, facility_id, is_active) VALUES
  -- システム管理者
  ('00000000-0000-0000-0000-000000000001', 'システム管理者', 'system_admin', NULL, true),
  
  -- 施設管理者
  ('00000000-0000-0000-0000-000000000002', '施設管理者（本店）', 'facility_admin', '550e8400-e29b-41d4-a716-446655440001', true),
  ('00000000-0000-0000-0000-000000000003', '施設管理者（新宿）', 'facility_admin', '550e8400-e29b-41d4-a716-446655440002', true),
  
  -- 一般ユーザー
  ('00000000-0000-0000-0000-000000000004', '一般ユーザー（本店）', 'user', '550e8400-e29b-41d4-a716-446655440001', true),
  ('00000000-0000-0000-0000-000000000005', '一般ユーザー（新宿）', 'user', '550e8400-e29b-41d4-a716-446655440002', true),
  ('00000000-0000-0000-0000-000000000006', '一般ユーザー（池袋）', 'user', '550e8400-e29b-41d4-a716-446655440003', true);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ユーザー一覧取得用RPC関数（email付き）
CREATE OR REPLACE FUNCTION get_users_with_email(
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0,
  role_filter TEXT DEFAULT NULL,
  facility_filter UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  facility_id UUID,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
    SELECT
      u.id,
      au.email::TEXT,
      u.name,
      u.role,
      u.facility_id,
      u.is_active,
      u.created_at,
      u.updated_at
    FROM public.users u
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE
      (role_filter IS NULL OR u.role = role_filter)
      AND (facility_filter IS NULL OR u.facility_id = facility_filter)
    ORDER BY u.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
