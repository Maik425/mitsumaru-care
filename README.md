# 🏥 mitsumarq-care

介護施設向けの包括的な管理システム

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 (App Router, TypeScript)
- **バックエンド**: tRPC + DDD Architecture
- **データベース**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **認証**: Supabase Auth
- **デプロイ**: Vercel

## 📁 プロジェクト構造

```
src/
├── app/                 # Next.js App Router
├── components/          # React コンポーネント
├── domain/             # DDD Domain Layer
│   ├── entities/       # エンティティ
│   ├── values/         # 値オブジェクト
│   └── repositories/   # リポジトリインターフェース
├── application/         # DDD Application Layer
│   └── usecases/       # ユースケース
├── infra/              # DDD Infrastructure Layer
│   ├── prisma/         # Prisma設定
│   ├── repositories/   # リポジトリ実装
│   └── mappers/        # データマッピング
└── server/             # tRPC API
    └── trpc/           # tRPC設定・ルーター
```

## 🛠️ 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、Supabaseの接続情報を設定してください。

### 3. データベースの初期化

```bash
source .env
pnpm prisma db push
pnpm prisma generate
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

## 📋 開発ルール

**重要**: 開発段階でのルールは [.cursor/rules.md](.cursor/rules.md) を参照してください。

### 毎回確認するルール

- データベーススキーマ変更時: `pnpm prisma db push && pnpm prisma generate`
- 環境変数の確認: `source .env`
- コード品質チェック: `pnpm check`
- 依存関係の更新確認: `pnpm install && pnpm typecheck`

## 🚀 利用可能なスクリプト

```bash
# 開発
pnpm dev                    # 開発サーバー起動
pnpm build                  # ビルド
pnpm start                  # 本番サーバー起動

# データベース
pnpm prisma:generate        # Prismaクライアント生成
pnpm prisma:migrate         # マイグレーション実行
pnpm prisma db push         # スキーマを直接反映（開発用）

# コード品質
pnpm typecheck              # TypeScript型チェック
pnpm format                 # Prettierでフォーマット
pnpm lint                   # ESLintでリント
pnpm check                  # 全チェック実行
pnpm check:strict           # 厳密なチェック
```

## 🔧 トラブルシューティング

よくある問題と解決方法は [.cursor/rules.md](.cursor/rules.md) のトラブルシューティングセクションを参照してください。

## 📚 参考資料

- [開発ルール](.cursor/rules.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
