# 実装計画

## 📋 概要

このドキュメントでは、みつまるケアプロジェクトの実装計画について詳細に説明します。

## 🎯 実装の全体方針

### 1. 段階的実装アプローチ

- **フェーズ1**: 基盤構築（データベース・認証）
- **フェーズ2**: 基本機能実装（マスターデータ・シフト管理）
- **フェーズ3**: 高度機能実装（役割表・勤怠管理）
- **フェーズ4**: 統合・テスト・最適化

### 2. 既存実装の活用

- **フロントエンド**: 既に完成しているUIをそのまま活用
- **設計書**: 詳細な設計を基に効率的な実装
- **技術スタック**: 検証済みの技術の組み合わせ

### 3. 品質保証

- **テスト駆動開発**: テストを先に実装して品質を保証
- **コードレビュー**: 実装後のコードレビューで品質向上
- **継続的改善**: フィードバックを基に継続的に改善

## 🚀 フェーズ1: 基盤構築（1週間）

### 1.1 Supabaseプロジェクトの設定

**開始日**: 2025年8月31日
**完了予定**: 2025年9月1日
**担当者**: 開発者

#### 作業内容

```bash
# 1. Supabaseプロジェクトの作成
# https://supabase.com/dashboard でプロジェクト作成

# 2. 環境変数の設定
# .env.local ファイルの作成
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 3. 接続テスト
# 基本的な接続確認
```

#### 成果物

- [ ] 動作するSupabase接続
- [ ] 環境変数ファイル
- [ ] 接続テスト結果

### 1.2 Prismaスキーマの実装

**開始日**: 2025年9月1日
**完了予定**: 2025年9月3日
**担当者**: 開発者

#### 作業内容

```bash
# 1. 既存スキーマの更新
# prisma/schema.prisma の更新

# 2. データベースマイグレーション
pnpm prisma db push

# 3. Prismaクライアントの再生成
pnpm prisma generate

# 4. 初期データの投入
pnpm prisma db seed
```

#### 成果物

- [ ] 更新されたPrismaスキーマ
- [ ] データベーステーブルの作成
- [ ] 初期データの投入完了

### 1.3 tRPCコンテキストの実装

**開始日**: 2025年9月4日
**完了予定**: 2025年9月5日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. tRPCコンテキストの設定
// src/server/trpc/context.ts

// 2. Supabaseクライアントの統合
// src/server/trpc/context.ts

// 3. 基本的なミドルウェアの実装
// src/server/trpc/middleware/
```

#### 成果物

- [ ] 動作するtRPCコンテキスト
- [ ] Supabase統合
- [ ] 基本的なミドルウェア

## 🔐 フェーズ2: 認証・認可システム（1週間）

### 2.1 認証ルーターの実装

**開始日**: 2025年9月6日
**完了予定**: 2025年9月10日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. 認証ルーターの作成
// src/server/trpc/routers/auth.ts

// 2. ログイン・ログアウト機能の実装
export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    // ログイン処理の実装
  }),
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // ログアウト処理の実装
  }),
  me: protectedProcedure.query(async ({ ctx }) => {
    // ユーザー情報取得の実装
  }),
});

// 3. 基本的なエラーハンドリング
// エラーレスポンスの統一
```

#### 成果物

- [ ] 動作する認証API
- [ ] ログイン・ログアウト機能
- [ ] 基本的なセキュリティ機能

### 2.2 認証ミドルウェアの実装

**開始日**: 2025年9月7日
**完了予定**: 2025年9月9日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. 認証ミドルウェア
// src/server/trpc/middleware/auth.ts

// 2. 権限チェックミドルウェア
// src/server/trpc/middleware/permission.ts

// 3. テナント分離ミドルウェア
// src/server/trpc/middleware/tenant.ts
```

#### 成果物

- [ ] 認証・認可の基盤
- [ ] 権限チェック機能
- [ ] テナント分離機能

## 📊 フェーズ3: マスターデータ管理（1週間）

### 3.1 シフト形態管理API

**開始日**: 2025年9月11日
**完了予定**: 2025年9月14日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. シフト形態ルーターの作成
// src/server/trpc/routers/shift-types.ts

// 2. CRUD操作の実装
export const shiftTypesRouter = router({
  create: adminProcedure
    .input(createShiftTypeSchema)
    .mutation(async ({ input, ctx }) => {
      // 作成処理の実装
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    // 一覧取得の実装
  }),
  update: adminProcedure
    .input(updateShiftTypeSchema)
    .mutation(async ({ input, ctx }) => {
      // 更新処理の実装
    }),
  delete: adminProcedure
    .input(deleteShiftTypeSchema)
    .mutation(async ({ input, ctx }) => {
      // 削除処理の実装
    }),
});
```

#### 成果物

- [ ] シフト形態管理API
- [ ] CRUD操作の実装
- [ ] 基本的なバリデーション

### 3.2 役職・技能管理API

**開始日**: 2025年9月15日
**完了予定**: 2025年9月17日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. 役職管理ルーター
// src/server/trpc/routers/positions.ts

// 2. 技能管理ルーター
// src/server/trpc/routers/skills.ts

// 3. 職種・配置ルール管理ルーター
// src/server/trpc/routers/job-rules.ts
```

#### 成果物

- [ ] 役職・技能管理API
- [ ] 職種・配置ルール管理API
- [ ] 関連データの管理機能

## 🔄 フェーズ4: シフト管理システム（1週間）

### 4.1 シフト管理API

**開始日**: 2025年9月18日
**完了予定**: 2025年9月22日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. シフト管理ルーター
// src/server/trpc/routers/shifts.ts

// 2. シフト作成・編集機能
export const shiftsRouter = router({
  create: adminProcedure
    .input(createShiftSchema)
    .mutation(async ({ input, ctx }) => {
      // シフト作成処理の実装
    }),
  update: adminProcedure
    .input(updateShiftSchema)
    .mutation(async ({ input, ctx }) => {
      // シフト更新処理の実装
    }),
  list: protectedProcedure
    .input(listShiftsSchema)
    .query(async ({ input, ctx }) => {
      // シフト一覧取得の実装
    }),
});

// 3. シフト割り当て管理
// ユーザーとシフトの関連付け
```

#### 成果物

- [ ] 完全なシフト管理API
- [ ] 複雑なビジネスロジックの実装
- [ ] パフォーマンス最適化

### 4.2 シフト交換システムAPI

**開始日**: 2025年9月19日
**完了予定**: 2025年9月21日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. シフト交換ルーター
// src/server/trpc/routers/shift-exchange.ts

// 2. 交換申請・承認機能
export const shiftExchangeRouter = router({
  request: protectedProcedure
    .input(requestExchangeSchema)
    .mutation(async ({ input, ctx }) => {
      // 交換申請処理の実装
    }),
  approve: adminProcedure
    .input(approveExchangeSchema)
    .mutation(async ({ input, ctx }) => {
      // 交換承認処理の実装
    }),
  reject: adminProcedure
    .input(rejectExchangeSchema)
    .mutation(async ({ input, ctx }) => {
      // 交換却下処理の実装
    }),
});
```

#### 成果物

- [ ] シフト交換システムAPI
- [ ] 申請・承認フローの実装
- [ ] 通知機能の実装

## 🔗 フェーズ5: フロントエンド連携（1週間）

### 5.1 ログイン機能の連携

**開始日**: 2025年9月23日
**完了予定**: 2025年9月25日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. 既存ログインフォームの更新
// components/login-form.tsx

// 2. tRPCクライアントとの連携
const loginMutation = trpc.auth.login.useMutation({
  onSuccess: data => {
    // ログイン成功時の処理
    router.push('/admin/dashboard');
  },
  onError: error => {
    // エラーハンドリング
    setError(error.message);
  },
});

// 3. 認証状態の管理
// コンテキストまたはZustandでの状態管理
```

#### 成果物

- [ ] 動作するログイン機能
- [ ] 認証状態の適切な管理
- [ ] ユーザー体験の向上

### 5.2 ダッシュボードの連携

**開始日**: 2025年9月26日
**完了予定**: 2025年9月28日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. 管理者ダッシュボードの更新
// components/admin-dashboard.tsx

// 2. リアルタイムデータの表示
const { data: recentShifts } = trpc.shifts.getRecent.useQuery();
const { data: attendanceAlerts } = trpc.attendance.getAlerts.useQuery();

// 3. ローディング状態の管理
const { isLoading, error } = trpc.shifts.getRecent.useQuery();
```

#### 成果物

- [ ] リアルタイムデータ表示
- [ ] 適切なローディング状態
- [ ] ユーザー体験の向上

## 🧪 フェーズ6: テスト・品質保証（1週間）

### 6.1 単体テストの実装

**開始日**: 2025年9月29日
**完了予定**: 2025年10月2日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. テストフレームワークの設定
// Jest + Testing Library

// 2. APIエンドポイントのテスト
describe('Auth Router', () => {
  it('should login user with valid credentials', async () => {
    // テストの実装
  });

  it('should reject login with invalid credentials', async () => {
    // テストの実装
  });
});

// 3. ビジネスロジックのテスト
// シフト作成・編集・削除のテスト
```

#### 成果物

- [ ] テストカバレッジ70%以上
- [ ] 自動化されたテスト
- [ ] 品質保証の基盤

### 6.2 統合テストの実装

**開始日**: 2025年10月3日
**完了予定**: 2025年10月5日
**担当者**: 開発者

#### 作業内容

```typescript
// 1. フロントエンド・バックエンド統合テスト
// ログインからダッシュボード表示までの一連の流れ

// 2. データベース統合テスト
// 実際のデータベースを使用したテスト

// 3. 認証フローの統合テスト
// ログイン・認証・権限チェックの一連の流れ
```

#### 成果物

- [ ] 統合テストの自動化
- [ ] 品質保証の向上
- [ ] デプロイ安全性の向上

## 📊 実装スケジュール

### 全体スケジュール

```
週1（8/31-9/6）:   フェーズ1 - 基盤構築
週2（9/7-9/13）:   フェーズ2 - 認証・認可システム
週3（9/14-9/20）:  フェーズ3 - マスターデータ管理
週4（9/21-9/27）:  フェーズ4 - シフト管理システム
週5（9/28-10/4）:  フェーズ5 - フロントエンド連携
週6（10/5-10/11）: フェーズ6 - テスト・品質保証
```

### マイルストーン

- **9月6日**: 基盤構築完了
- **9月13日**: 認証システム完了
- **9月20日**: マスターデータ管理完了
- **9月27日**: シフト管理システム完了
- **10月4日**: フロントエンド連携完了
- **10月11日**: テスト・品質保証完了

## 🚨 リスク管理

### 高リスク項目

1. **Supabase制限**: 無料プランの制限による機能制約
   - **対策**: 有料プランへの移行検討、制限内での最適化

2. **セキュリティ実装**: 複雑な認証・認可システムの実装難易度
   - **対策**: 段階的な実装、セキュリティ専門家への相談

### 中リスク項目

1. **既存コードとの統合**: モックデータからAPI連携への移行
   - **対策**: 段階的な移行、十分なテスト

2. **パフォーマンス**: 大量データ処理時の性能問題
   - **対策**: パフォーマンステスト、最適化の実施

## 💡 成功のポイント

### 1. 段階的実装

- 基盤から順番に実装
- 各フェーズでの動作確認
- 問題の早期発見・対応

### 2. 既存実装の活用

- フロントエンドUIの再利用
- 設計書の活用
- 技術スタックの活用

### 3. 品質保証

- テスト駆動開発
- コードレビュー
- 継続的改善

---

**次のステップ**: [進捗追跡](./progress-tracking.md) の開始
