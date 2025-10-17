## Why

現在の技能管理機能は2つのコンポーネントが存在しますが、どちらもフロントエンドのUIのみが実装されており、バックエンドとの連携ができていません。施設管理者が技能を登録・管理し、職員の技能管理に活用できる機能が必要です。また、シフト管理や役割表管理で技能情報が活用されているため、統一された技能マスターが必要です。

## What Changes

- **ADDED**: 技能マスターテーブルの作成（skills）
- **ADDED**: 職員技能関連テーブルの作成（user_skills）
- **ADDED**: 職員プロファイルテーブルの作成（user_profiles）
- **ADDED**: 技能管理API（CRUD操作）
- **ADDED**: 職員技能管理API（職員への技能割り当て・更新）
- **ADDED**: 職員プロファイル管理API（基本情報の統合管理）
- **MODIFIED**: 技能登録コンポーネント（バックエンド連携）
- **MODIFIED**: 職員技能管理コンポーネント（バックエンド連携）
- **MODIFIED**: シフト管理コンポーネント（技能データとの連携）
- **MODIFIED**: シフト交換システム（技能マッチングの動的化）
- **ADDED**: 施設別技能管理機能（施設管理者は所属施設の技能のみ管理可能）

## Impact

- Affected specs: `skills-management`, `staff-management`, `shift-management`
- Affected code:
  - `src/server/routers/skills.ts` (新規作成)
  - `src/server/routers/user-profiles.ts` (新規作成)
  - `src/components/skills-management.tsx` (バックエンド連携)
  - `src/components/staff-skill-management.tsx` (バックエンド連携)
  - `src/components/role-management.tsx` (技能データとの連携)
  - `src/components/shift-exchange-system.tsx` (技能マッチングの動的化)
  - `src/lib/repositories/skills.repository.ts` (新規作成)
  - `src/lib/repositories/user-profiles.repository.ts` (新規作成)
  - `src/lib/dto/skills.dto.ts` (新規作成)
  - `src/lib/dto/user-profiles.dto.ts` (新規作成)
- **BREAKING**: 技能管理のUI動作が変更（ダミーデータから実際のAPI呼び出しへ）
- **BREAKING**: 職員情報の管理方法が統一される
