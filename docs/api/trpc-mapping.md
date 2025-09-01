# tRPC API Mapping

本ドキュメントは、フロントエンド実装に基づくtRPC APIの現状マッピング（使用中/既存未使用/新規必要）を機能別に整理したものです。

- エンドポイント: `/api/trpc`
- クライアント設定: `src/app/providers.tsx`（`Authorization: Bearer <token>` を付与）
- ルーター集約: `src/server/trpc/routers/index.ts`

## 認証（auth）

- 使用中
  - `auth.login`（Mutation）: サインイン（`src/hooks/use-auth.ts`）
  - `auth.logout`（Mutation）: サインアウト（`src/hooks/use-auth.ts`）
  - `auth.me`（Query）: ログイン中ユーザー取得（`src/hooks/use-auth.ts`）
- 既存（未使用）
  - `auth.getUsers`（Query, admin）: ユーザー一覧
  - `auth.getPermissions`（Query, admin）: 権限一覧
  - `auth.getRoles`（Query, admin）: ロール一覧
- 備考
  - ルーター: `src/server/trpc/routers/auth.ts`
  - 認可ミドルウェア: `src/server/trpc/middleware/auth.ts`（`protectedProcedure`, `adminProcedure`）

## シフト形態（shiftTypes）

- 使用中
  - `shiftTypes.list`（Query）: 一覧（`src/app/admin/master/shift-types/page.tsx`）
  - `shiftTypes.create`（Mutation）: 追加（`src/app/admin/master/shift-types/page.tsx`）
- 既存（未使用）
  - `shiftTypes.update`（Mutation）: 更新
  - `shiftTypes.delete`（Mutation）: 削除
- 今後必要（UI追加時）
  - 形態編集/削除UIで上記未使用APIを利用
- ルーター: `src/server/trpc/routers/shift-types.ts`

## シフト（shifts）

- 使用中（スタブ統合済み）
  - `shifts.create`（Mutation）: 作成（`components/shift-create-form.tsx`）- フェーズ1: ダミー処理
  - `shifts.update`（Mutation）: 更新（`components/shift-create-form.tsx`）- フェーズ1: ダミー処理
- 既存（未使用）
  - `shifts.list`（Query）: 一覧
  - `shifts.get`（Query）: 取得
  - `shifts.delete`（Mutation）: 削除
- 今後必要（フェーズ2）
  - 実際のPrisma接続でダミー処理を置き換え
- ルーター: `src/server/trpc/routers/shifts.ts`

## 役割表（roleAssignments）

- 使用中
  - `roleAssignments.list`（Query）: 一覧（`src/app/admin/role-assignments/page.tsx`）
  - `roleAssignments.create`（Mutation）: 作成（`src/app/admin/role-assignments/page.tsx`）
- 既存（未使用）
  - `roleAssignments.get`（Query）: 取得
  - `roleAssignments.update`（Mutation）: 更新
  - `roleAssignments.delete`（Mutation）: 削除
- 今後必要（UI追加時）
  - 役割表詳細/編集/削除UIで上記未使用APIを利用
- ルーター: `src/server/trpc/routers/role-assignments.ts`

## 勤怠（attendance）

- 使用中（スタブ統合済み）
  - `attendance.submitCorrection`（Mutation）: 修正申請（`components/user-attendance.tsx`）- フェーズ1: ダミー処理
- 既存（未使用）
  - `attendance.get`（Query）: 勤怠記録取得
  - `attendance.checkInOut`（Mutation）: 出退勤打刻
  - `attendance.request`（Mutation）: 勤怠申請作成
  - `attendance.approveReject`（Mutation, admin）: 申請承認/却下
  - `attendance.summary`（Query, admin）: 勤怠集計
- 今後必要（フェーズ2）
  - 実際のPrisma接続でダミー処理を置き換え
  - 出退勤打刻、勤怠記録取得の統合
- ルーター: `src/server/trpc/routers/attendance.ts`

## マスタ（positions / skills / jobRules）

- 使用中
  - 現状なし（フロントからの呼び出し未実装）
- 既存（未使用）
  - `positions.(list|create|update|delete)`
  - `skills.(list|create|update|delete)`
  - `jobRules.(list|create|update|delete)`
- 今後必要（UI追加時）
  - マスタ管理UIを実装し、上記APIを利用
- ルーター:
  - `src/server/trpc/routers/positions.ts`
  - `src/server/trpc/routers/skills.ts`
  - `src/server/trpc/routers/job-rules.ts`

## ヘルスチェック（health）

- 既存
  - `health.check`（Query）: 稼働確認
- 使用中
  - 現状フロント未使用（監視/診断用途に利用可）
- ルーター: `src/server/trpc/routers/index.ts`

## シフト交換（shiftExchange）

- 使用中（スタブ統合済み）
  - `shiftExchange.request`（Mutation）: 交換申請（`app/user/shift-exchange/page.tsx`）- フェーズ1: ダミー処理
  - `shiftExchange.approve`（Mutation）: 交換承認（`app/admin/shift-exchange/page.tsx`）- フェーズ1: ダミー処理
- 今後必要（新規作成）
  - `shiftExchange.list`（Query）: 申請一覧
  - `shiftExchange.get`（Query）: 申請詳細
  - `shiftExchange.reject`（Mutation）: 交換却下
- 今後必要（フェーズ2）
  - 実際のPrisma接続でダミー処理を置き換え
  - ルーター新規作成: `src/server/trpc/routers/shift-exchange.ts`

## 休日管理（holiday-management）

- 現状
  - `components/holiday-management.tsx` はモックUIでAPI未接続
- 新規作成が望ましいAPI案（tRPC 例）
  - 休暇申請: `holidayRequests.create`, `holidayRequests.list`, `holidayRequests.get`, `holidayRequests.update`, `holidayRequests.delete`
  - 承認フロー: `holidayApprovals.list`, `holidayApprovals.approve`, `holidayApprovals.reject`
  - 交換申請: `holidayExchanges.create`, `holidayExchanges.list`, `holidayExchanges.propose`, `holidayExchanges.accept`, `holidayExchanges.reject`
  - 通知/履歴: `notifications.list`, `approvalHistory.list`
- 備考
  - 既存の勤怠申請（`attendance.request`, `attendance.approveReject`）を拡張して統合運用も検討可（要件次第）

## 補足（認可）

- `protectedProcedure`: Bearerトークン必須（Supabase検証 + DBユーザー取得）
- `adminProcedure`: 上記に加えて管理権限（`SYSTEM_SETTINGS`/`USER_MANAGEMENT`/`ROLE_MANAGEMENT` のいずれか）
- ミドルウェア: `src/server/trpc/middleware/auth.ts`

## 次アクション提案

- UIに存在して未配線の機能があれば、対応する既存APIを接続（例: shiftTypes の更新/削除、shifts/roleAssignments の詳細/更新/削除）。
- 休日管理は要件確定後に専用ルーター（例: `src/server/trpc/routers/holidays.ts`）を追加、もしくは `attendance` を拡張。
- テスト観点では、主要クエリ/ミューテーションのE2Eもしくはモックベースの結合テストを追加。
