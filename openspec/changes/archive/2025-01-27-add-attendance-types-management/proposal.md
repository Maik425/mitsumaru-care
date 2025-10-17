## Why

現在のシフト形態管理機能はフロントエンドのUIのみが実装されており、バックエンドとの連携ができていません。施設管理者がシフト形態を登録・管理し、シフト作成や勤怠管理に活用できる機能が必要です。また、既存のshiftsテーブルが存在するものの、シフト形態管理コンポーネントとの連携ができていないため、統一されたシフト形態マスターが必要です。

## What Changes

- **MODIFIED**: 既存shiftsテーブルの拡張（color_code, description, is_night_shift等の追加）
- **ADDED**: シフト形態管理API（CRUD操作）
- **MODIFIED**: シフト形態管理コンポーネント（バックエンド連携）
- **MODIFIED**: シフト作成フォーム（シフト形態データとの連携）
- **MODIFIED**: シフト編集フォーム（シフト形態データとの連携）
- **MODIFIED**: 勤怠管理システム（シフト形態データとの連携）
- **ADDED**: 施設別シフト形態管理機能（施設管理者は所属施設のシフト形態のみ管理可能）
- **ADDED**: 夜勤対応機能（日をまたぐシフトの適切な処理）

## Impact

- Affected specs: `attendance-types-management`, `shift-management`, `attendance-management`
- Affected code:
  - `src/server/routers/shifts.ts` (新規作成)
  - `src/components/attendance-types-management.tsx` (バックエンド連携)
  - `src/components/shift-create-form.tsx` (シフト形態データとの連携)
  - `src/components/shift-edit-form.tsx` (シフト形態データとの連携)
  - `src/components/attendance-management.tsx` (シフト形態データとの連携)
  - `src/lib/repositories/shifts.repository.ts` (新規作成)
  - `src/lib/dto/shifts.dto.ts` (新規作成)
- **BREAKING**: シフト形態管理のUI動作が変更（ダミーデータから実際のAPI呼び出しへ）
- **BREAKING**: シフト作成・編集でのシフト形態選択が動的になる
