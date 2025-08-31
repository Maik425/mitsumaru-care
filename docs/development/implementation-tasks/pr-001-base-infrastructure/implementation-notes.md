# PR #1: 実装時の注意事項

## 📋 概要

このドキュメントでは、PR #1（基盤インフラ構築）の実装時に注意すべき事項をまとめています。

## ⚠️ 重要な注意事項

### 1. 環境変数の管理

#### セキュリティ

- **絶対にコミットしない**: `.env.local` ファイルは `.gitignore` に含める
- **適切な権限**: Service Role Keyは最小限の権限で設定
- **本番環境**: 本番環境では異なるキーを使用

#### 設定例

```bash
# .env.local（コミットしない）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# .env.example（コミットする）
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. データベーススキーマの変更

#### 開発段階での注意

- **`prisma db push`**: 開発段階では直接反映
- **マイグレーション履歴**: 本格的なマイグレーションは設計確定後
- **データのバックアップ**: 重要なデータは事前にバックアップ

#### 推奨コマンド

```bash
# 開発段階
pnpm prisma db push

# 本格的なマイグレーション（設計確定後）
pnpm prisma migrate dev --name production_ready_schema
```

### 3. tRPCコンテキストの実装

#### 型安全性

- **strict mode**: TypeScript strict modeを有効にする
- **型定義**: 適切な型定義を実装
- **エラーハンドリング**: 統一されたエラーレスポンス

#### 実装例

```typescript
// src/server/trpc/context.ts
import { createTRPCContext } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';

export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Supabaseクライアントの初期化
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return {
    req,
    res,
    supabase,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
```

## 🔧 実装手順

### ステップ1: Supabaseプロジェクトの設定

#### 1.1 プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. "New Project" をクリック
3. プロジェクト名: `mitsumaru-care-dev`
4. データベースパスワードを設定（安全なパスワードを使用）
5. リージョンを選択（東京リージョン推奨）

#### 1.2 環境変数の設定

1. プロジェクト設定からAPI Keyを取得
2. `.env.local` ファイルを作成
3. 必要な環境変数を設定
4. 接続テストを実行

#### 1.3 接続テスト

```bash
# 環境変数の確認
cat .env.local | grep SUPABASE

# 開発サーバーの起動
pnpm dev

# ブラウザで接続確認
```

### ステップ2: Prismaスキーマの実装

#### 2.1 スキーマの更新

1. `prisma/schema.prisma` を開く
2. データベース設計書に基づいてスキーマを更新
3. 認証・認可テーブルを実装
4. マスターデータテーブルを実装
5. ビジネスデータテーブルを実装

#### 2.2 データベースマイグレーション

```bash
# スキーマの反映
pnpm prisma db push

# クライアントの再生成
pnpm prisma generate

# データベースの確認
pnpm prisma studio
```

#### 2.3 初期データの投入

1. シードスクリプトを作成
2. 初期データを定義
3. データを投入
4. データの確認

### ステップ3: tRPCコンテキストの実装

#### 3.1 ディレクトリ構造の作成

```bash
mkdir -p src/server/trpc/middleware
mkdir -p src/server/trpc/routers
```

#### 3.2 コンテキストの実装

1. `src/server/trpc/context.ts` を作成
2. Supabaseクライアントを統合
3. 基本的な型定義を実装
4. エラーハンドリングを実装

#### 3.3 ミドルウェアの実装

1. 認証ミドルウェアの基本構造
2. ログミドルウェアの実装
3. エラーハンドリングミドルウェアの実装

#### 3.4 ルーターの基本構造

1. 基本ルーターの実装
2. ルーターの統合
3. 基本的なエンドポイントの実装

## 🧪 テスト方法

### 単体テスト

```bash
# 型チェック
pnpm type-check

# ビルドテスト
pnpm build

# リンター
pnpm lint
```

### 統合テスト

```bash
# データベース接続テスト
pnpm prisma studio

# API接続テスト
pnpm dev
# ブラウザでエンドポイントをテスト
```

### 手動テスト

1. 開発サーバーの起動
2. 基本的な機能の動作確認
3. エラーハンドリングの確認
4. パフォーマンスの確認

## 🚨 よくある問題と解決方法

### 問題1: 環境変数が読み込まれない

```bash
# 解決方法
source .env.local
# または
export $(cat .env.local | xargs)
```

### 問題2: Prismaクライアントエラー

```bash
# 解決方法
pnpm prisma generate
pnpm prisma db push
```

### 問題3: データベース接続エラー

```bash
# 解決方法
# .env.localの接続情報を確認
cat .env.local | grep SUPABASE

# Supabaseプロジェクトの設定を確認
# データベースパスワードを確認
```

### 問題4: tRPCコンテキストエラー

```bash
# 解決方法
# 型定義を確認
pnpm type-check

# ビルドエラーを確認
pnpm build
```

## 📚 参考資料

### 公式ドキュメント

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)

### 設計書

- [データベース設計書](../../../database/README.md)
- [API設計書](../../../api/README.md)
- [セキュリティ設計書](../../../security/README.md)

### サンプルコード

- [Next.js + tRPC Example](https://github.com/trpc/trpc/tree/main/examples/next)
- [Supabase + Next.js Example](https://github.com/supabase/supabase/tree/master/examples/nextjs)

## 🔄 次のステップ

PR #1が完了したら、以下のPRに進みます：

1. **PR #2**: 認証システム実装
2. **PR #3**: マスターデータAPI実装
3. **PR #4**: シフト管理API実装

---

**次のステップ**: [受け入れ基準](./acceptance-criteria.md) の確認
