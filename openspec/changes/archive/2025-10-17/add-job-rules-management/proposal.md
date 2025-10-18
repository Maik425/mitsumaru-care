## Why

現在の配置ルールテンプレート管理機能はフロントエンドのUIのみが実装されており、バックエンドとの連携ができていません。施設管理者が配置ルールテンプレートを登録・管理し、シフト作成や役割表管理に活用できる機能が必要です。また、シフト編集フォームで既に配置ルールの概念が使用されているため、統一された配置ルールテンプレートマスターが必要です。

## What Changes

- **ADDED**: 配置ルールテンプレートテーブルの作成（job_rule_templates）
- **ADDED**: 配置ルールセットテーブルの作成（job_rule_sets）
- **ADDED**: 職種マスターテーブルの作成（job_types）
- **ADDED**: エリアマスターテーブルの作成（areas）
- **ADDED**: 配置ルール管理API（CRUD操作）
- **MODIFIED**: 配置ルールテンプレート管理コンポーネント（バックエンド連携）
- **MODIFIED**: シフト作成フォーム（配置ルールテンプレートとの連携）
- **MODIFIED**: シフト編集フォーム（配置ルールテンプレートとの連携）
- **MODIFIED**: 役割表管理システム（配置ルールテンプレートとの連携）
- **ADDED**: 施設別配置ルール管理機能（施設管理者は所属施設のルールのみ管理可能）
- **ADDED**: 配置ルール適用機能（シフト作成時の自動配置提案）

## Impact

- Affected specs: `job-rules-management`, `shift-management`, `role-management`
- Affected code:
  - `src/server/routers/job-rules.ts` (新規作成)
  - `src/components/job-rules-management.tsx` (バックエンド連携)
  - `src/components/shift-create-form.tsx` (配置ルールテンプレートとの連携)
  - `src/components/shift-edit-form.tsx` (配置ルールテンプレートとの連携)
  - `src/components/role-management.tsx` (配置ルールテンプレートとの連携)
  - `src/lib/repositories/job-rules.repository.ts` (新規作成)
  - `src/lib/dto/job-rules.dto.ts` (新規作成)
- **BREAKING**: 配置ルール管理のUI動作が変更（ダミーデータから実際のAPI呼び出しへ）
- **BREAKING**: シフト作成・編集での配置ルール選択が動的になる
- **BREAKING**: 役割表管理での配置ルール適用が動的になる
