# PR-006: 認証・認可システムの実装とAPI接続の完了

このPRでは、PR-005で実装したデータベース統合を完成させ、認証・認可システムを実装してE2Eテストを通過させます。

## 方針

- 認証・認可システムの完全実装
- 実際のAPI接続の完了
- E2Eテストの安定化
- 型エラーの解消

## タスク一覧

### 1. 認証・認可システムの実装

- [x] `src/lib/auth-helpers.ts`の完全実装
- [x] 認証ガードの実装（`protectedProcedure`, `adminProcedure`）
- [x] ユーザーセッション管理の実装
- [x] ロールベースアクセス制御の実装

### 2. API接続の完了

- [x] `components/shift-create-form.tsx`の実際のAPI接続
- [x] `components/user-attendance.tsx`の実際のAPI接続
- [x] `app/user/shift-exchange/page.tsx`の実際のAPI接続
- [x] `app/admin/shift-exchange/page.tsx`の実際のAPI接続

### 3. 型エラーの解消

- [x] 未使用変数の削除
- [x] 型定義の修正
- [x] importパスの修正

### 4. E2Eテストの安定化

- [x] 認証フローの実装
- [x] テストデータの準備
- [x] テストの実行と修正

### 5. ドキュメント更新

- [x] API仕様書の更新
- [x] 実装状況の更新

実装順: 1 → 2 → 3 → 4 → 5
