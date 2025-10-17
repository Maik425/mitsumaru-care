## Why

現在のアカウント管理機能はフロントエンドのUIのみが実装されており、バックエンドとの連携ができていません。施設管理者が新しいアカウントを作成し、施設との紐づけを行う機能が必要です。

## What Changes

- **ADDED**: アカウント作成API（Supabase Auth + ユーザーテーブル連携）
- **ADDED**: アカウント一覧取得API（施設別フィルタリング）
- **ADDED**: アカウント編集・削除API
- **ADDED**: アカウント有効/無効化API
- **MODIFIED**: フロントエンドのアカウント管理コンポーネント（バックエンド連携）
- **ADDED**: 施設選択機能（施設管理者が所属施設のユーザーのみ管理可能）

## Impact

- Affected specs: `user-management`, `auth-system`
- Affected code:
  - `src/server/routers/users.ts` (新規作成)
  - `src/components/accounts-management.tsx` (バックエンド連携)
  - `src/lib/repositories/user.repository.ts` (拡張)
  - `src/lib/dto/user.dto.ts` (拡張)
- **BREAKING**: アカウント管理のUI動作が変更（ダミーデータから実際のAPI呼び出しへ）
