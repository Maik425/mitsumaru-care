# E2Eテスト実行ガイド

## 📋 概要

このディレクトリには、みつまるケアシステムのE2E（End-to-End）テストが含まれています。これらのテストは、ユーザーが実際に使用するであろうユースケースに基づいて作成されており、システムの品質と信頼性を保証します。

## 🧪 テストファイル構成

### 1. `shift-management.spec.ts` - メイン機能テスト

- **認証フロー** - ログイン・ログアウト・権限確認
- **シフト管理フロー** - シフト作成・編集・確定
- **勤怠管理フロー** - 出退勤打刻・修正申請・承認
- **役割表管理フロー** - 役割表作成・自動割り当て
- **シフト交換フロー** - 申請・承認・却下
- **アクセス制限テスト** - 権限による機能制限
- **エラーハンドリングテスト** - ネットワークエラー・バリデーション
- **パフォーマンステスト** - 大量データ表示時の性能

### 2. `authentication-flow.spec.ts` - 認証・認可詳細テスト

- **ログインフロー詳細テスト** - 各ユーザー種別の権限確認
- **セッション管理テスト** - タイムアウト・複数タブ管理
- **パスワードセキュリティテスト** - 強度チェック・変更・再ログイン
- **権限エスカレーション防止テスト** - 不正アクセス試行の制限
- **ログイン試行制限テスト** - アカウントロック・CAPTCHA
- **多要素認証テスト** - 2FA機能の動作確認

## 🚀 テスト実行方法

### 前提条件

- Node.js 18以上がインストールされている
- プロジェクトの依存関係がインストールされている（`pnpm install`）
- 開発サーバーが起動している（`pnpm dev`）

### 基本的なテスト実行

```bash
# 全テストを実行
pnpm test:e2e

# UIモードでテストを実行（推奨）
pnpm test:e2e:ui

# デバッグモードでテストを実行
pnpm test:e2e:debug

# 特定のテストファイルを実行
pnpm test:e2e --grep "認証フロー"

# 特定のテストケースを実行
pnpm test:e2e --grep "正常なログイン - 管理者"
```

### テスト実行オプション

```bash
# ヘッドレスモードで実行（CI/CD用）
pnpm test:e2e --headless

# 並列実行（高速化）
pnpm test:e2e --workers=4

# 特定のブラウザで実行
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# 失敗したテストのみ再実行
pnpm test:e2e --grep-invert "passed"
```

## 🎯 テスト戦略

### 1. ユースケースベーステスト

各テストは、`docs/user-usecases.md`で定義されたユースケースに基づいて作成されています：

- **UC-COM-001**: ログイン・ログアウト
- **UC-ADM-001**: 月間シフト作成
- **UC-ADM-002**: シフト編集・調整
- **UC-EMP-001**: 出退勤打刻
- **UC-ADM-005**: 勤怠状況の確認・承認
- **UC-ADM-004**: 役割表作成
- **UC-EMP-004**: シフト交換申請
- **UC-ADM-003**: シフト交換申請の承認・却下

### 2. テストデータ管理

テストでは、以下のテストユーザーを使用します：

```typescript
const testUsers = {
  admin: {
    email: 'admin@mitsumaru-care.com',
    password: 'admin123',
    name: '管理者 太郎',
    role: 'ADMIN',
  },
  owner: {
    email: 'owner@mitsumaru-care.com',
    password: 'owner123',
    name: '施設長 一郎',
    role: 'OWNER',
  },
  employee: {
    email: 'employee@mitsumaru-care.com',
    password: 'employee123',
    name: '職員 花子',
    role: 'MEMBER',
  },
  nurse: {
    email: 'nurse@mitsumaru-care.com',
    password: 'nurse123',
    name: '看護師 三郎',
    role: 'MEMBER',
  },
};
```

### 3. テスト実行順序

テストは以下の順序で実行されることを想定しています：

1. **認証テスト** - システムへのアクセス制御
2. **基本機能テスト** - 各ユーザー種別の主要機能
3. **統合テスト** - 機能間の連携・データフロー
4. **セキュリティテスト** - 権限・アクセス制御
5. **パフォーマンステスト** - 大量データ処理
6. **エラーハンドリングテスト** - 異常系の処理

## 🔧 テスト環境設定

### 1. 環境変数

テスト実行前に以下の環境変数を設定してください：

```bash
# .env.test ファイルを作成
NEXT_PUBLIC_API_URL=http://localhost:3000
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/mitsumaru_care_test
TEST_SUPABASE_URL=http://localhost:54321
TEST_SUPABASE_ANON_KEY=your-test-anon-key
```

### 2. テストデータベース

テスト用のデータベースを準備してください：

```bash
# テスト用データベースを作成
createdb mitsumaru_care_test

# テスト用スキーマを適用
pnpm prisma db push --schema=prisma/schema.test.prisma

# テスト用データを投入
pnpm db:seed:test
```

### 3. モック・スタブ設定

外部サービスとの連携が必要な場合は、適切なモック・スタブを設定してください：

```typescript
// 例：Supabase Authのモック
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.mockSupabaseAuth = {
      signIn: async credentials => ({ data: { user: mockUser }, error: null }),
      signOut: async () => ({ error: null }),
    };
  });
});
```

## 📊 テスト結果の確認

### 1. テストレポート

テスト実行後、以下のレポートが生成されます：

- **HTMLレポート**: `playwright-report/index.html`
- **JUnitレポート**: `test-results/junit.xml`
- **カバレッジレポート**: `coverage/lcov-report/index.html`

### 2. スクリーンショット・動画

テスト失敗時には、以下のファイルが自動生成されます：

- **スクリーンショット**: `test-results/screenshots/`
- **動画**: `test-results/videos/`
- **トレース**: `test-results/traces/`

### 3. テスト結果の分析

```bash
# テスト結果サマリーを表示
pnpm test:e2e --reporter=list

# 詳細なレポートを生成
pnpm test:e2e --reporter=html

# カバレッジレポートを生成
pnpm test:e2e --reporter=coverage
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. テストがタイムアウトする

```bash
# タイムアウト時間を延長
pnpm test:e2e --timeout=60000

# 特定のテストのタイムアウトを設定
test('長時間の処理', async ({ page }) => {
  test.setTimeout(120000);
  // テスト内容
});
```

#### 2. 要素が見つからない

```bash
# デバッグモードで実行
pnpm test:e2e:debug

# セレクターの確認
await page.pause();
```

#### 3. 認証が失敗する

```bash
# テスト用ユーザーの確認
pnpm db:seed:test

# 認証設定の確認
cat .env.test
```

#### 4. データベース接続エラー

```bash
# テスト用データベースの状態確認
psql -d mitsumaru_care_test -c "\dt"

# スキーマの再適用
pnpm prisma db push --schema=prisma/schema.test.prisma
```

## 📈 継続的改善

### 1. テストケースの追加

新しい機能が追加された際は、対応するテストケースを作成してください：

```typescript
test('新機能のテスト', async ({ page }) => {
  // テスト内容
});
```

### 2. テストデータの更新

ユーザー要件が変更された際は、テストデータを更新してください：

```typescript
// テストデータの更新
const updatedTestUsers = {
  // 更新されたユーザー情報
};
```

### 3. パフォーマンス改善

テスト実行時間が長くなった場合は、以下の対策を検討してください：

- テストの並列実行
- 不要なテストの削除
- モック・スタブの活用
- テストデータの最適化

## 🤝 貢献方法

### 1. バグレポート

テストで発見されたバグは、適切なIssueとして報告してください。

### 2. テストケースの提案

追加すべきテストケースがあれば、Pull Requestとして提案してください。

### 3. ドキュメントの改善

このREADMEの改善提案も歓迎します。

## 📚 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [ユースケース定義書](../docs/user-usecases.md)
- [システム要件定義書](../docs/requirements/README.md)
- [業務フロー設計書](../docs/workflows/README.md)
