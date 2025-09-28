# 認証システム実装記録

## 概要

ユーザー認証システムとユーザー管理機能の実装

## 実装内容

### 1. ユーザーロール設計

- **システム管理者**: 全システムの管理、ユーザー管理
- **施設管理者**: 施設内の業務管理（現在のadmin機能）
- **一般ユーザー**: 基本的な利用者機能

### 2. URL構造の再設計

#### 現在の構造

```
src/app/
├── admin/          # 施設管理者用（不適切なURL）
├── user/           # 一般ユーザー用
└── api/            # API
```

#### 新しい構造

```
src/app/
├── system/         # システム管理者用
│   └── users/      # ユーザー管理
├── facility/       # 施設管理者用（旧admin）
│   ├── dashboard/
│   ├── attendance/
│   ├── roles/
│   ├── settings/
│   ├── shift/
│   └── staff/
├── user/           # 一般ユーザー用
└── api/            # API
```

### 3. 認証バックエンド実装

- tRPC + Supabaseを使用
- ユーザー認証、セッション管理
- ロールベースアクセス制御

### 4. 実装ステップ

1. ✅ ユーザーロール設計
2. ✅ 認証バックエンド実装
3. ✅ appディレクトリ再構築
4. ✅ ユーザー管理ページ実装
5. ✅ ログインフォーム更新

### 5. 実装詳細

#### 5.1 ユーザーロール設計

- `src/lib/types/auth.ts`: ユーザーロール、権限、型定義
- 3つのロール: システム管理者、施設管理者、一般ユーザー
- ロールベースアクセス制御（RBAC）実装

#### 5.2 認証バックエンド

- `src/server/routers/auth.ts`: 認証関連のtRPCルーター
- `src/server/routers/users.ts`: ユーザー管理のtRPCルーター
- Supabase認証と連携
- セッション管理、パスワードリセット機能

#### 5.3 URL構造変更

- `src/app/admin/` → `src/app/facility/` (施設管理者用)
- `src/app/system/` 新規追加 (システム管理者用)
- `src/app/user/` 維持 (一般ユーザー用)

#### 5.4 ユーザー管理機能

- `src/components/user-management.tsx`: ユーザー管理コンポーネント
- ユーザー一覧、作成、編集、削除機能
- ロール別フィルタリング、検索機能

#### 5.5 ログイン機能

- `src/components/login-form.tsx`: バックエンド連携ログイン
- ロール別リダイレクト機能
- エラーハンドリング

### 6. URL構造変更の完了

- ✅ プロジェクト全体の`/admin/`リンクを`/facility/`に変更
- ✅ ナビゲーションリンクの更新
- ✅ ドキュメントの更新
- ✅ コンポーネント名の変更（`admin-dashboard.tsx` → `facility-dashboard.tsx`）

### 7. データベーススキーマ実装完了

- ✅ `supabase/migrations/001_initial_schema.sql` 作成
- ✅ 完全なリセット機能付きマイグレーション
- ✅ テーブル作成、RLSポリシー、ダミーデータ
- ✅ データベースマイグレーション実行完了

#### 実装されたテーブル

```sql
-- facilities テーブル
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- users テーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('system_admin', 'facility_admin', 'user')),
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### セキュリティ機能

- ✅ Row Level Security (RLS) ポリシー
- ✅ ロールベースアクセス制御
- ✅ インデックス最適化
- ✅ 更新日時自動更新トリガー

### 8. 認証システム統合完了

- ✅ `useAuth` フック実装
- ✅ `AuthContext` プロバイダー実装
- ✅ `AuthGuard` コンポーネント実装
- ✅ ログインフォームのSupabase認証統合
- ✅ システム管理者ページの認証ガード実装
- ✅ ダッシュボード各所のログアウトボタンで `signOut` 呼び出しを実装

### 9. プロジェクト構造整理

- ✅ `supabase/.temp` ディレクトリ削除
- ✅ `docs/PR/` ディレクトリ構造に変更
- ✅ 機密情報の適切な管理（`confidential/`ディレクトリ）
- ✅ `AGENTS.md` のセキュリティ改善

### 10. データベース構造の最適化

- ✅ カラム重複の解消（email、name）
- ✅ `public.users`テーブルの正規化
- ✅ `auth.users`と`public.users`の責任分離
- ✅ 外部キー制約によるデータ整合性保証

#### 最適化されたテーブル構造

**`auth.users` (認証専用)**

- `id`, `email`, `encrypted_password`
- `email_confirmed_at`, `created_at`, `updated_at`
- 認証関連のメタデータ（`raw_user_meta_data`は空）

**`public.users` (アプリケーション固有)**

- `id` (auth.users.idを参照)
- `name`, `role`, `facility_id`, `is_active`
- `created_at`, `updated_at`

#### 重複解消の詳細

- ❌ **削除**: `public.users.email` → `auth.users.email`を使用
- ❌ **削除**: `auth.users.raw_user_meta_data.name` → `public.users.name`を使用
- ✅ **統一**: データの取得元を明確化
- ✅ **最適化**: Supabaseベストプラクティスに準拠

## 技術スタック

- Next.js App Router
- tRPC
- Supabase
- TypeScript
- Tailwind CSS
- shadcn/ui
