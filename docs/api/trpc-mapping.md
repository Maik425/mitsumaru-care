# tRPC API マッピング

このドキュメントは、UI機能とtRPC APIエンドポイントの対応関係を記録します。

## 認証・認可システム

- 実装完了（PR-006）
  - `protectedProcedure`: 認証済みユーザーのみアクセス可能
  - `adminProcedure`: 管理者権限が必要
  - ロールベースアクセス制御（RBAC）
  - セッション管理・タイムアウト処理

## シフト管理（shifts）

- 実装完了（PR-006 - データベース統合完了）
  - `shifts.create`（Mutation）: シフト作成（`components/shift-create-form.tsx`）- 実際のDB操作
  - `shifts.update`（Mutation）: シフト編集（`components/shift-create-form.tsx`）- 実際のDB操作
  - `shifts.list`（Query）: シフト一覧取得
  - `shifts.get`（Query）: シフト詳細取得

## 勤怠管理（attendance）

- 実装完了（PR-006 - データベース統合完了）
  - `attendance.submitCorrection`（Mutation）: 修正申請（`components/user-attendance.tsx`）- 実際のDB操作
  - `attendance.record`（Mutation）: 出退勤記録
  - `attendance.list`（Query）: 勤怠一覧取得
  - `attendance.get`（Query）: 勤怠詳細取得

## シフト交換（shiftExchange）

- 実装完了（PR-006 - データベース統合完了）
  - `shiftExchange.request`（Mutation）: 交換申請（`app/user/shift-exchange/page.tsx`）- 実際のDB操作
  - `shiftExchange.approve`（Mutation）: 交換承認（`app/admin/shift-exchange/page.tsx`）- 実際のDB操作
  - `shiftExchange.reject`（Mutation）: 交換却下 - 実際のDB操作
  - `shiftExchange.list`（Query）: 申請一覧 - 実際のDB操作
  - `shiftExchange.get`（Query）: 申請詳細 - 実際のDB操作
- 実装完了
  - シフト交換専用ルーター（`src/server/trpc/routers/shift-exchange.ts`）
  - Prismaスキーマ（`ShiftExchange`モデル）
  - テストデータ（seed.ts）
  - E2Eテスト対応

## 休日管理（holiday-management）

- 使用中（スタブ統合済み）
  - `holidays.create`（Mutation）: 休日登録
  - `holidays.update`（Mutation）: 休日編集
  - `holidays.list`（Query）: 休日一覧
- 今後必要（フェーズ2）
  - 実際のPrisma接続でダミー処理を置き換え

## 役割表管理（role-assignments）

- 使用中（スタブ統合済み）
  - `roleAssignments.create`（Mutation）: 役割表作成
  - `roleAssignments.list`（Query）: 役割表一覧
- 今後必要（フェーズ2）
  - 実際のPrisma接続でダミー処理を置き換え

## マスターデータ管理

### シフト形態管理（shift-types）

- 実装完了（PR-003）
  - `shiftTypes.create`（Mutation）: シフト形態作成
  - `shiftTypes.update`（Mutation）: シフト形態編集
  - `shiftTypes.list`（Query）: シフト形態一覧
  - `shiftTypes.get`（Query）: シフト形態詳細

### 役職管理（positions）

- 実装完了（PR-003）
  - `positions.create`（Mutation）: 役職作成
  - `positions.update`（Mutation）: 役職編集
  - `positions.list`（Query）: 役職一覧
  - `positions.get`（Query）: 役職詳細

### 技能管理（skills）

- 実装完了（PR-003）
  - `skills.create`（Mutation）: 技能作成
  - `skills.update`（Mutation）: 技能編集
  - `skills.list`（Query）: 技能一覧
  - `skills.get`（Query）: 技能詳細

## 認証・認可システム

### ユーザー管理（users）

- 実装完了（PR-006）
  - `users.login`（Mutation）: ログイン処理
  - `users.logout`（Mutation）: ログアウト処理
  - `users.getProfile`（Query）: プロフィール取得
  - `users.updateProfile`（Mutation）: プロフィール更新

### 権限管理（permissions）

- 実装完了（PR-006）
  - ロールベースアクセス制御（RBAC）
  - 権限チェック機能
  - セッション管理

## 実装状況サマリー

- **PR-003完了**: マスターデータ管理API
- **PR-004完了**: システム統合（スタブ処理）
- **PR-005完了**: データベース統合（シフト交換機能）
- **PR-006完了**: 認証・認可システムとAPI接続の完了

## 次のステップ

- **PR-007予定**: 残りのマスターデータ管理のデータベース統合
- **PR-008予定**: 本格的な認証システム（Supabase JWT）への移行
- **PR-009予定**: パフォーマンス最適化とセキュリティ強化
