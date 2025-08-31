# みつまるケア プロジェクトルール

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 (App Router, TypeScript)
- **バックエンド**: tRPC + DDD Architecture
- **データベース**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **認証**: Supabase Auth
- **デプロイ**: Vercel
- **UIライブラリ**: React + shadcn/ui, Tailwind CSS
- **状態管理**: React Hooks + Context API
- **バリデーション**: Zod
- **アーキテクチャ**: Layered Architecture, Domain-Driven Design (DDD)

## 📝 開発ルール

### 1. コードスタイル

- TypeScript strict mode を使用
- ESLint + Prettier でコードフォーマット統一
- 関数・変数名は日本語の意図が分かる英語名
- コメントは日本語で記述

### 2. ファイル・ディレクトリ命名

- コンポーネント: PascalCase (例: `UserDashboard.tsx`)
- ページ: kebab-case (例: `user-dashboard/page.tsx`)
- ユーティリティ: camelCase (例: `formatDate.ts`)
- 定数: UPPER_SNAKE_CASE (例: `API_ENDPOINTS.ts`)

### 3. データベーススキーマ変更時

```bash
# スキーマ変更後は必ず以下を実行
pnpm prisma db push        # データベースに直接反映
pnpm prisma generate      # クライアントを再生成
```

### 4. 環境変数

- `.env.local` にローカル開発用の環境変数を設定
- 本番環境変数は Vercel で管理
- 環境変数変更時は `.env.example` も更新

### 5. コード品質チェック

```bash
# 開発前後で以下を実行
pnpm lint                 # ESLint チェック
pnpm type-check          # TypeScript 型チェック
pnpm build               # ビルドテスト
```

### 6. 依存関係更新

- セキュリティアップデートは即座に適用
- メジャーバージョン更新は事前にテスト
- `pnpm update` で定期的に更新

## 📁 開発進捗管理

### ディレクトリ構成

```
docs/development/
├── README.md                    # 開発進捗管理のトップレベル
├── current-sprint.md            # 現在のスプリント状況
├── next-tasks.md               # 次の作業内容
├── implementation-plan.md       # 実装計画
├── progress-tracking.md         # 進捗追跡
├── milestones/                  # マイルストーン管理
│   ├── phase1-basic-design.md  # 第1段階完了
│   ├── phase2-detailed-design.md # 第2段階完了
│   ├── phase3-implementation-design.md # 第3段階完了
│   └── phase4-development.md   # 第4段階（開発フェーズ）
├── tasks/                       # タスク管理
│   ├── backend/                 # バックエンドタスク
│   ├── frontend/                # フロントエンドタスク
│   └── infrastructure/          # インフラタスク
└── reviews/                     # レビュー・検証
    ├── design-review.md         # 設計レビュー
    └── implementation-review.md # 実装レビュー
```

### ファイル命名規則

#### 完了済み

- `phase1-complete.md` - 第1段階完了
- `phase2-complete.md` - 第2段階完了
- `phase3-complete.md` - 第3段階完了
- `phase4-complete.md` - 第4段階完了

#### 進行中

- `current-sprint.md` - 現在のスプリント状況
- `active-tasks.md` - 進行中のタスク
- `progress-tracking.md` - 進捗追跡

#### 計画・設計

- `next-tasks.md` - 次の作業内容
- `implementation-plan.md` - 実装計画
- `development-roadmap.md` - 開発ロードマップ

#### 完了報告

- `phase1-completion.md` - 第1段階完了報告
- `phase2-completion.md` - 第2段階完了報告
- `phase3-completion.md` - 第3段階完了報告
- `phase4-completion.md` - 第4段階完了報告

#### レビュー・検証

- `design-review.md` - 設計レビュー
- `implementation-review.md` - 実装レビュー
- `code-review.md` - コードレビュー

#### タスク管理

- `backend-tasks.md` - バックエンドタスク
- `frontend-tasks.md` - フロントエンドタスク
- `infrastructure-tasks.md` - インフラタスク

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. Prisma エラー

```bash
# スキーマ変更後、クライアントが更新されない
pnpm prisma generate

# データベース接続エラー
pnpm prisma db push --force-reset
```

#### 2. tRPC エラー

```bash
# 型エラーが解決されない
pnpm build
pnpm type-check
```

#### 3. Supabase 接続エラー

- 環境変数の確認
- プロジェクトの有効性確認
- API Key の権限確認

#### 4. ビルドエラー

```bash
# 依存関係のクリーンアップ
rm -rf node_modules
rm -rf .next
pnpm install
pnpm build
```

## 📚 参考資料

### 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

### 設計書

- [要件定義](./docs/requirements/README.md)
- [基本設計](./docs/entities/README.md)
- [詳細設計](./docs/workflows/README.md)
- [実装設計](./docs/database/README.md)

### 開発進捗

- [開発進捗管理](./docs/development/README.md)
- [現在のスプリント](./docs/development/current-sprint.md)
- [次の作業内容](./docs/development/next-tasks.md)
- [実装計画](./docs/development/implementation-plan.md)
