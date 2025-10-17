## Why

現在の役職管理機能はフロントエンドのUIのみが実装されており、バックエンドとの連携ができていません。施設管理者が役職を登録・管理し、職員の役職割り当てやシフト管理に活用できる機能が必要です。また、他のコンポーネント（アカウント管理、役割表管理、シフト管理など）でも役職情報が参照されているため、統一された役職マスターが必要です。

## What Changes

- **ADDED**: 役職マスターテーブルの作成（positions）
- **ADDED**: 職員役職関連テーブルの作成（user_positions）
- **ADDED**: 職員プロファイルテーブルの作成（user_profiles）
- **ADDED**: 役職管理API（CRUD操作）
- **ADDED**: 職員役職管理API（職員への役職割り当て・更新）
- **ADDED**: 職員プロファイル管理API（基本情報の統合管理）
- **MODIFIED**: 役職登録コンポーネント（バックエンド連携）
- **MODIFIED**: アカウント管理コンポーネント（役職選択の動的化）
- **MODIFIED**: 役割表管理コンポーネント（役職選択の動的化）
- **MODIFIED**: シフト管理コンポーネント（役職データとの連携）
- **MODIFIED**: シフト交換システム（役職マッチングの動的化）
- **ADDED**: 施設別役職管理機能（施設管理者は所属施設の役職のみ管理可能）

## Impact

- Affected specs: `positions-management`, `user-management`, `role-management`, `shift-management`
- Affected code:
  - `src/server/routers/positions.ts` (新規作成)
  - `src/server/routers/user-profiles.ts` (新規作成)
  - `src/components/positions-management.tsx` (バックエンド連携)
  - `src/components/accounts-management.tsx` (役職選択の動的化)
  - `src/components/role-templates-management.tsx` (役職選択の動的化)
  - `src/components/role-management.tsx` (役職データとの連携)
  - `src/components/shift-exchange-system.tsx` (役職マッチングの動的化)
  - `src/lib/repositories/positions.repository.ts` (新規作成)
  - `src/lib/repositories/user-profiles.repository.ts` (新規作成)
  - `src/lib/dto/positions.dto.ts` (新規作成)
  - `src/lib/dto/user-profiles.dto.ts` (新規作成)
- **BREAKING**: 役職管理のUI動作が変更（ダミーデータから実際のAPI呼び出しへ）
- **BREAKING**: 他のコンポーネントでの役職選択が動的になる
- **BREAKING**: 職員情報の管理方法が統一される
