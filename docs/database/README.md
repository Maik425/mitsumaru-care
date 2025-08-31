# データベース設計書

## 📋 1. 概要

このドキュメントでは、みつまるケアシステムのデータベース設計について詳細に説明します。

### 1.1 設計方針

- **基本エンティティ設計**に基づく詳細スキーマ設計
- **マルチテナント**対応によるデータ分離
- **適切な正規化**によるデータ整合性の確保
- **パフォーマンス**を考慮したインデックス設計
- **拡張性**を考慮した柔軟な構造

### 1.2 技術スタック

- **データベース**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **接続**: プール接続 + ダイレクト接続
- **マイグレーション**: Prisma Migrate

## 🏗️ 2. データベーススキーマ

### 2.1 認証・認可系テーブル

#### 2.1.1 users（ユーザー）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_number ON users(employee_number);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### 2.1.2 tenants（テナント）

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone_number VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_tenants_name ON tenants(name);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);
```

#### 2.1.3 user_tenant_roles（ユーザーテナント権限）

```sql
CREATE TABLE user_tenant_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- インデックス
CREATE INDEX idx_user_tenant_roles_user_id ON user_tenant_roles(user_id);
CREATE INDEX idx_user_tenant_roles_tenant_id ON user_tenant_roles(tenant_id);
CREATE INDEX idx_user_tenant_roles_role ON user_tenant_roles(role);

-- ユニーク制約
ALTER TABLE user_tenant_roles ADD CONSTRAINT unique_user_tenant UNIQUE(user_id, tenant_id);
```

#### 2.1.4 user_role列挙型

```sql
CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
```

### 2.2 マスターデータ系テーブル

#### 2.2.1 shift_types（シフト形態）

```sql
CREATE TABLE shift_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_time INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(7) NOT NULL DEFAULT '#2563eb',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_shift_types_tenant_id ON shift_types(tenant_id);
CREATE INDEX idx_shift_types_is_active ON shift_types(is_active);
CREATE INDEX idx_shift_types_name ON shift_types(name);

-- 制約
ALTER TABLE shift_types ADD CONSTRAINT check_break_time CHECK (break_time >= 0);
ALTER TABLE shift_types ADD CONSTRAINT check_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
```

#### 2.2.2 positions（役職）

```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  required_skills JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_positions_tenant_id ON positions(tenant_id);
CREATE INDEX idx_positions_is_active ON positions(is_active);
CREATE INDEX idx_positions_name ON positions(name);
CREATE INDEX idx_positions_required_skills ON positions USING GIN(required_skills);
```

#### 2.2.3 skills（技能）

```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category skill_category NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_skills_tenant_id ON skills(tenant_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_is_active ON skills(is_active);
CREATE INDEX idx_skills_name ON skills(name);
```

#### 2.2.4 skill_category列挙型

```sql
CREATE TYPE skill_category AS ENUM ('CARE', 'MEDICAL', 'ADMINISTRATIVE', 'OTHER');
```

#### 2.2.5 job_rules（職種・配置ルール）

```sql
CREATE TABLE job_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  shift_type_id UUID NOT NULL REFERENCES shift_types(id) ON DELETE CASCADE,
  required_positions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_job_rules_tenant_id ON job_rules(tenant_id);
CREATE INDEX idx_job_rules_shift_type_id ON job_rules(shift_type_id);
CREATE INDEX idx_job_rules_is_active ON job_rules(is_active);
CREATE INDEX idx_job_rules_required_positions ON job_rules USING GIN(required_positions);
```

#### 2.2.6 role_templates（役割表テンプレート）

```sql
CREATE TABLE role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  shift_type_id UUID NOT NULL REFERENCES shift_types(id) ON DELETE CASCADE,
  roles JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_role_templates_tenant_id ON role_templates(tenant_id);
CREATE INDEX idx_role_templates_shift_type_id ON role_templates(shift_type_id);
CREATE INDEX idx_role_templates_is_active ON role_templates(is_active);
CREATE INDEX idx_role_templates_roles ON role_templates USING GIN(roles);
```

### 2.3 業務データ系テーブル

#### 2.3.1 shifts（シフト）

```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_type_id UUID NOT NULL REFERENCES shift_types(id) ON DELETE CASCADE,
  status shift_status DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_shifts_tenant_id ON shifts(tenant_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_shift_type_id ON shifts(shift_type_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_tenant_date ON shifts(tenant_id, date);

-- 制約
ALTER TABLE shifts ADD CONSTRAINT unique_tenant_date UNIQUE(tenant_id, date);
```

#### 2.3.2 shift_status列挙型

```sql
CREATE TYPE shift_status AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED');
```

#### 2.3.3 shift_assignments（シフト割り当て）

```sql
CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  is_substitute BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_shift_assignments_shift_id ON shift_assignments(shift_id);
CREATE INDEX idx_shift_assignments_user_id ON shift_assignments(user_id);
CREATE INDEX idx_shift_assignments_position_id ON shift_assignments(position_id);
CREATE INDEX idx_shift_assignments_is_substitute ON shift_assignments(is_substitute);

-- 制約
ALTER TABLE shift_assignments ADD CONSTRAINT unique_shift_user UNIQUE(shift_id, user_id);
```

#### 2.3.4 role_assignments（役割割り当て）

```sql
CREATE TABLE role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status role_assignment_status DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_role_assignments_tenant_id ON role_assignments(tenant_id);
CREATE INDEX idx_role_assignments_shift_id ON role_assignments(shift_id);
CREATE INDEX idx_role_assignments_date ON role_assignments(date);
CREATE INDEX idx_role_assignments_status ON role_assignments(status);
CREATE INDEX idx_role_assignments_tenant_date ON role_assignments(tenant_id, date);

-- 制約
ALTER TABLE role_assignments ADD CONSTRAINT unique_tenant_date UNIQUE(tenant_id, date);
```

#### 2.3.5 role_assignment_status列挙型

```sql
CREATE TYPE role_assignment_status AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED');
```

#### 2.3.6 role_assignment_details（役割割り当て詳細）

```sql
CREATE TABLE role_assignment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_assignment_id UUID NOT NULL REFERENCES role_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_role_assignment_details_role_assignment_id ON role_assignment_details(role_assignment_id);
CREATE INDEX idx_role_assignment_details_user_id ON role_assignment_details(user_id);
CREATE INDEX idx_role_assignment_details_role_name ON role_assignment_details(role_name);
```

#### 2.3.7 attendances（勤怠）

```sql
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  planned_start_time TIME NOT NULL,
  planned_end_time TIME NOT NULL,
  actual_start_time TIME,
  actual_end_time TIME,
  status attendance_status DEFAULT 'PLANNED',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_attendances_tenant_id ON attendances(tenant_id);
CREATE INDEX idx_attendances_user_id ON attendances(user_id);
CREATE INDEX idx_attendances_shift_id ON attendances(shift_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_attendances_status ON attendances(status);
CREATE INDEX idx_attendances_tenant_date ON attendances(tenant_id, date);
CREATE INDEX idx_attendances_user_date ON attendances(user_id, date);

-- 制約
ALTER TABLE attendances ADD CONSTRAINT unique_user_shift UNIQUE(user_id, shift_id);
ALTER TABLE attendances ADD CONSTRAINT check_planned_times CHECK (planned_start_time < planned_end_time);
ALTER TABLE attendances ADD CONSTRAINT check_actual_times CHECK (
  actual_start_time IS NULL OR
  actual_end_time IS NULL OR
  actual_start_time < actual_end_time
);
```

#### 2.3.8 attendance_status列挙型

```sql
CREATE TYPE attendance_status AS ENUM (
  'PLANNED', 'CHECKED_IN', 'CHECKED_OUT', 'ABSENT',
  'LATE', 'EARLY_LEAVE', 'OVERTIME'
);
```

#### 2.3.9 holidays（休暇）

```sql
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type holiday_type NOT NULL,
  status holiday_status DEFAULT 'REQUESTED',
  reason TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_holidays_tenant_id ON holidays(tenant_id);
CREATE INDEX idx_holidays_user_id ON holidays(user_id);
CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_type ON holidays(type);
CREATE INDEX idx_holidays_status ON holidays(status);
CREATE INDEX idx_holidays_approved_by ON holidays(approved_by);
CREATE INDEX idx_holidays_tenant_date ON holidays(tenant_id, date);
CREATE INDEX idx_holidays_user_date ON holidays(user_id, date);

-- 制約
ALTER TABLE holidays ADD CONSTRAINT unique_user_date UNIQUE(user_id, date);
```

#### 2.3.10 holiday_type列挙型

```sql
CREATE TYPE holiday_type AS ENUM (
  'PAID_LEAVE', 'SICK_LEAVE', 'PERSONAL_LEAVE', 'EXCHANGE_LEAVE'
);
```

#### 2.3.11 holiday_status列挙型

```sql
CREATE TYPE holiday_status AS ENUM (
  'REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED'
);
```

### 2.4 設定系テーブル

#### 2.4.1 attendance_rules（勤怠ルール）

```sql
CREATE TABLE attendance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  late_threshold INTEGER NOT NULL DEFAULT 15,
  early_leave_threshold INTEGER NOT NULL DEFAULT 15,
  overtime_threshold INTEGER NOT NULL DEFAULT 0,
  break_time_rules JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_attendance_rules_tenant_id ON attendance_rules(tenant_id);
CREATE INDEX idx_attendance_rules_is_active ON attendance_rules(is_active);
CREATE INDEX idx_attendance_rules_break_time_rules ON attendance_rules USING GIN(break_time_rules);

-- 制約
ALTER TABLE attendance_rules ADD CONSTRAINT check_thresholds CHECK (
  late_threshold >= 0 AND
  early_leave_threshold >= 0 AND
  overtime_threshold >= 0
);
```

## 🔗 3. テーブル間の関係

### 3.1 外部キー制約

```sql
-- 既存の外部キー制約に加えて、追加の制約を定義

-- ユーザーとシフト割り当ての関係
ALTER TABLE shift_assignments
ADD CONSTRAINT fk_shift_assignments_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- シフトと役割割り当ての関係
ALTER TABLE role_assignments
ADD CONSTRAINT fk_role_assignments_shift
FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE;

-- 勤怠とシフトの関係
ALTER TABLE attendances
ADD CONSTRAINT fk_attendances_shift
FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE;

-- 休暇承認者の関係
ALTER TABLE holidays
ADD CONSTRAINT fk_holidays_approved_by
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
```

### 3.2 カスケード削除設定

```sql
-- テナント削除時のカスケード削除
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_tenant;
ALTER TABLE shift_types DROP CONSTRAINT IF EXISTS fk_shift_types_tenant;
ALTER TABLE positions DROP CONSTRAINT IF EXISTS fk_positions_tenant;
ALTER TABLE skills DROP CONSTRAINT IF EXISTS fk_skills_tenant;
ALTER TABLE job_rules DROP CONSTRAINT IF EXISTS fk_job_rules_tenant;
ALTER TABLE role_templates DROP CONSTRAINT IF EXISTS fk_role_templates_tenant;
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS fk_shifts_tenant;
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_tenant;
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS fk_attendances_tenant;
ALTER TABLE holidays DROP CONSTRAINT IF EXISTS fk_holidays_tenant;
ALTER TABLE attendance_rules DROP CONSTRAINT IF EXISTS fk_attendance_rules_tenant;

-- シフト削除時のカスケード削除
ALTER TABLE shift_assignments DROP CONSTRAINT IF EXISTS fk_shift_assignments_shift;
ALTER TABLE role_assignments DROP CONSTRAINT IF EXISTS fk_role_assignments_shift;
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS fk_attendances_shift;

-- 役割割り当て削除時のカスケード削除
ALTER TABLE role_assignment_details DROP CONSTRAINT IF EXISTS fk_role_assignment_details_role_assignment;
```

## 📊 4. インデックス設計

### 4.1 パフォーマンス最適化インデックス

```sql
-- 複合インデックス（頻繁に使用される組み合わせ）
CREATE INDEX idx_shifts_tenant_date_status ON shifts(tenant_id, date, status);
CREATE INDEX idx_attendances_tenant_date_status ON attendances(tenant_id, date, status);
CREATE INDEX idx_holidays_tenant_date_status ON holidays(tenant_id, date, status);

-- 部分インデックス（アクティブなデータのみ）
CREATE INDEX idx_active_shift_types ON shift_types(tenant_id, name) WHERE is_active = true;
CREATE INDEX idx_active_positions ON positions(tenant_id, name) WHERE is_active = true;
CREATE INDEX idx_active_skills ON skills(tenant_id, name) WHERE is_active = true;

-- 日付範囲検索用インデックス
CREATE INDEX idx_shifts_date_range ON shifts(date) WHERE date >= CURRENT_DATE - INTERVAL '1 year';
CREATE INDEX idx_attendances_date_range ON attendances(date) WHERE date >= CURRENT_DATE - INTERVAL '1 year';
CREATE INDEX idx_holidays_date_range ON holidays(date) WHERE date >= CURRENT_DATE - INTERVAL '1 year';
```

### 4.2 全文検索インデックス

```sql
-- ユーザー名の全文検索
CREATE INDEX idx_users_name_search ON users USING gin(to_tsvector('japanese', name));

-- 役職名の全文検索
CREATE INDEX idx_positions_name_search ON positions USING gin(to_tsvector('japanese', name));

-- 技能名の全文検索
CREATE INDEX idx_skills_name_search ON skills USING gin(to_tsvector('japanese', name));
```

## 🔒 5. セキュリティ設計

### 5.1 Row Level Security (RLS)

```sql
-- テナント別データ分離のためのRLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_rules ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの例（テナント別分離）
CREATE POLICY tenant_isolation_policy ON users
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_policy ON shifts
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ユーザー自身のデータのみアクセス可能
CREATE POLICY user_own_data_policy ON attendances
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY user_own_data_policy ON holidays
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);
```

### 5.2 データ暗号化

```sql
-- 機密データの暗号化（PostgreSQLのpgcrypto拡張を使用）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 電話番号の暗号化
ALTER TABLE users ADD COLUMN phone_number_encrypted BYTEA;
CREATE INDEX idx_users_phone_number_encrypted ON users(phone_number_encrypted);

-- 暗号化関数
CREATE OR REPLACE FUNCTION encrypt_phone_number(phone_number TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(phone_number, key);
END;
$$ LANGUAGE plpgsql;

-- 復号化関数
CREATE OR REPLACE FUNCTION decrypt_phone_number(encrypted_data BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_data, key);
END;
$$ LANGUAGE plpgsql;
```

## 📈 6. パフォーマンス最適化

### 6.1 パーティショニング

```sql
-- 日付別パーティショニング（大規模データ対応）
-- シフトテーブルの月別パーティショニング
CREATE TABLE shifts_2024_01 PARTITION OF shifts
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE shifts_2024_02 PARTITION OF shifts
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- 勤怠テーブルの月別パーティショニング
CREATE TABLE attendances_2024_01 PARTITION OF attendances
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE attendances_2024_02 PARTITION OF attendances
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### 6.2 マテリアライズドビュー

```sql
-- 月次勤怠集計のマテリアライズドビュー
CREATE MATERIALIZED VIEW monthly_attendance_summary AS
SELECT
  tenant_id,
  user_id,
  DATE_TRUNC('month', date) as month,
  COUNT(*) as total_days,
  COUNT(CASE WHEN status = 'CHECKED_IN' THEN 1 END) as checked_in_days,
  COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent_days,
  COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late_days,
  COUNT(CASE WHEN status = 'EARLY_LEAVE' THEN 1 END) as early_leave_days,
  COUNT(CASE WHEN status = 'OVERTIME' THEN 1 END) as overtime_days
FROM attendances
GROUP BY tenant_id, user_id, DATE_TRUNC('month', date);

-- インデックス
CREATE INDEX idx_monthly_attendance_summary_tenant_month ON monthly_attendance_summary(tenant_id, month);
CREATE INDEX idx_monthly_attendance_summary_user_month ON monthly_attendance_summary(user_id, month);

-- 定期更新（日次）
CREATE OR REPLACE FUNCTION refresh_monthly_attendance_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_attendance_summary;
END;
$$ LANGUAGE plpgsql;
```

## 🔄 7. データ移行・バックアップ

### 7.1 初期データ投入

```sql
-- デフォルトテナントの作成
INSERT INTO tenants (id, name, address, phone_number) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'みつまるケア本社', '東京都渋谷区...', '03-1234-5678');

-- デフォルトシフト形態の作成
INSERT INTO shift_types (tenant_id, name, start_time, end_time, break_time, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '早番', '07:00', '15:00', 60, '#3b82f6'),
  ('550e8400-e29b-41d4-a716-446655440000', '日勤', '09:00', '17:00', 60, '#10b981'),
  ('550e8400-e29b-41d4-a716-446655440000', '遅番', '15:00', '23:00', 60, '#f59e0b'),
  ('550e8400-e29b-41d4-a716-446655440000', '夜勤', '23:00', '07:00', 60, '#8b5cf6');

-- デフォルト役職の作成
INSERT INTO positions (tenant_id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '介護福祉士', '介護業務の専門職'),
  ('550e8400-e29b-41d4-a716-446655440000', '看護師', '医療業務の専門職'),
  ('550e8400-e29b-41d4-a716-446655440000', 'ヘルパー', '介護補助業務'),
  ('550e8400-e29b-41d4-a716-446655440000', '事務員', '事務・管理業務');

-- デフォルト技能の作成
INSERT INTO skills (tenant_id, name, category, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '食事介助', 'CARE', '食事の介助業務'),
  ('550e8400-e29b-41d4-a716-446655440000', '入浴介助', 'CARE', '入浴の介助業務'),
  ('550e8400-e29b-41d4-a716-446655440000', '排泄介助', 'CARE', '排泄の介助業務'),
  ('550e8400-e29b-41d4-a716-446655440000', '移乗介助', 'CARE', '移乗の介助業務'),
  ('550e8400-e29b-41d4-a716-446655440000', '服薬管理', 'MEDICAL', '服薬の管理業務'),
  ('550e8400-e29b-41d4-a716-446655440000', '記録・報告', 'ADMINISTRATIVE', '記録・報告業務');
```

### 7.2 バックアップ戦略

```sql
-- 日次バックアップのための関数
CREATE OR REPLACE FUNCTION create_backup()
RETURNS void AS $$
BEGIN
  -- 現在の日時をファイル名に含めてバックアップを作成
  PERFORM pg_dump(
    'dbname=mitsumaru_care',
    '--format=custom',
    '--file=/backups/mitsumaru_care_' || to_char(current_date, 'YYYY_MM_DD') || '.backup'
  );
END;
$$ LANGUAGE plpgsql;

-- 定期実行のためのスケジュール（pg_cron拡張が必要）
-- SELECT cron.schedule('daily-backup', '0 2 * * *', 'SELECT create_backup();');
```

## 📝 8. Prismaスキーマ

### 8.1 完全なPrismaスキーマ

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

enum UserRole {
  OWNER
  ADMIN
  MEMBER
}

enum ShiftStatus {
  DRAFT
  PUBLISHED
  COMPLETED
}

enum RoleAssignmentStatus {
  DRAFT
  PUBLISHED
  COMPLETED
}

enum AttendanceStatus {
  PLANNED
  CHECKED_IN
  CHECKED_OUT
  ABSENT
  LATE
  EARLY_LEAVE
  OVERTIME
}

enum HolidayType {
  PAID_LEAVE
  SICK_LEAVE
  PERSONAL_LEAVE
  EXCHANGE_LEAVE
}

enum HolidayStatus {
  REQUESTED
  APPROVED
  REJECTED
  CANCELLED
}

enum SkillCategory {
  CARE
  MEDICAL
  ADMINISTRATIVE
  OTHER
}

model User {
  id             String            @id @default(cuid())
  email          String            @unique
  name           String
  employeeNumber String            @unique
  phoneNumber    String?
  isActive       Boolean           @default(true)
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  memberships    UserTenantRole[]
  shiftAssignments ShiftAssignment[]
  roleAssignmentDetails RoleAssignmentDetail[]
  attendances   Attendance[]
  holidays      Holiday[]
  approvedHolidays Holiday[] @relation("HolidayApprover")

  @@map("users")
}

model Tenant {
  id          String            @id @default(cuid())
  name        String
  address     String?
  phoneNumber String?
  isActive    Boolean           @default(true)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  memberships UserTenantRole[]
  shiftTypes ShiftType[]
  positions  Position[]
  skills     Skill[]
  jobRules   JobRule[]
  roleTemplates RoleTemplate[]
  shifts     Shift[]
  roleAssignments RoleAssignment[]
  attendances Attendance[]
  holidays   Holiday[]
  attendanceRules AttendanceRule[]

  @@map("tenants")
}

model UserTenantRole {
  id       String   @id @default(cuid())
  userId   String
  tenantId String
  role     UserRole
  isActive Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([userId, tenantId])
  @@map("user_tenant_roles")
}

model ShiftType {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  startTime String
  endTime   String
  breakTime Int      @default(0)
  color     String   @default("#2563eb")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  shifts    Shift[]
  jobRules  JobRule[]
  roleTemplates RoleTemplate[]

  @@map("shift_types")
}

model Position {
  id             String   @id @default(cuid())
  tenantId       String
  name           String
  description    String?
  requiredSkills String[] @default([])
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  shiftAssignments ShiftAssignment[]

  @@map("positions")
}

model Skill {
  id          String        @id @default(cuid())
  tenantId    String
  name        String
  category    SkillCategory
  description String?
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("skills")
}

model JobRule {
  id               String   @id @default(cuid())
  tenantId         String
  name             String
  shiftTypeId      String
  requiredPositions String[] @default([])
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  tenant           Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  shiftType        ShiftType @relation(fields: [shiftTypeId], references: [id], onDelete: Cascade)

  @@map("job_rules")
}

model RoleTemplate {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  shiftTypeId String
  roles       String[] @default([])
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  shiftType   ShiftType @relation(fields: [shiftTypeId], references: [id], onDelete: Cascade)

  @@map("role_templates")
}

model Shift {
  id          String        @id @default(cuid())
  tenantId    String
  date        DateTime      @db.Date
  shiftTypeId String
  status      ShiftStatus   @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  shiftType   ShiftType     @relation(fields: [shiftTypeId], references: [id], onDelete: Cascade)
  shiftAssignments ShiftAssignment[]
  roleAssignments RoleAssignment[]
  attendances Attendance[]

  @@unique([tenantId, date])
  @@map("shifts")
}

model ShiftAssignment {
  id           String   @id @default(cuid())
  shiftId      String
  userId       String
  positionId   String
  isSubstitute Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  shift        Shift    @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  position     Position @relation(fields: [positionId], references: [id], onDelete: Cascade)

  @@unique([shiftId, userId])
  @@map("shift_assignments")
}

model RoleAssignment {
  id        String                @id @default(cuid())
  tenantId  String
  shiftId   String
  date      DateTime              @db.Date
  status    RoleAssignmentStatus @default(DRAFT)
  createdAt DateTime              @default(now())
  updatedAt DateTime              @updatedAt

  tenant    Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  shift     Shift                 @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  assignments RoleAssignmentDetail[]

  @@unique([tenantId, date])
  @@map("role_assignments")
}

model RoleAssignmentDetail {
  id                String   @id @default(cuid())
  roleAssignmentId  String
  userId            String
  roleName          String
  startTime         String
  endTime           String
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  roleAssignment    RoleAssignment @relation(fields: [roleAssignmentId], references: [id], onDelete: Cascade)
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("role_assignment_details")
}

model Attendance {
  id               String            @id @default(cuid())
  tenantId         String
  userId           String
  shiftId          String
  date             DateTime          @db.Date
  plannedStartTime String
  plannedEndTime   String
  actualStartTime  String?
  actualEndTime    String?
  status           AttendanceStatus  @default(PLANNED)
  notes            String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  tenant           Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  shift            Shift             @relation(fields: [shiftId], references: [id], onDelete: Cascade)

  @@unique([userId, shiftId])
  @@map("attendances")
}

model Holiday {
  id          String        @id @default(cuid())
  tenantId    String
  userId      String
  date        DateTime      @db.Date
  type        HolidayType
  status      HolidayStatus @default(REQUESTED)
  reason      String?
  approvedBy  String?
  approvedAt  DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  approver    User?         @relation("HolidayApprover", fields: [approvedBy], references: [id])

  @@unique([userId, date])
  @@map("holidays")
}

model AttendanceRule {
  id                    String   @id @default(cuid())
  tenantId              String
  name                  String
  lateThreshold         Int      @default(15)
  earlyLeaveThreshold   Int      @default(15)
  overtimeThreshold     Int      @default(0)
  breakTimeRules        String[] @default([])
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("attendance_rules")
}
```

---

**次段階**: [セキュリティ設計](./../security/README.md) に進む
