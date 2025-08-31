# 🚀 mitsumarq-care 開発ルール

## 🎯 プロジェクト概要

- **プロジェクト名**: mitsumarq-care
- **フレームワーク**: Next.js 14 (App Router, TypeScript)
- **バックエンド**: tRPC + DDD Architecture
- **データベース**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **認証**: Supabase Auth
- **デプロイ**: Vercel

## 🔄 毎回確認するルール

### 1. **データベーススキーマ変更時**

```bash
# スキーマを変更したら必ず実行
pnpm prisma db push        # データベースに直接反映
pnpm prisma generate      # クライアントを再生成
```

### 2. **環境変数の確認**

```bash
# 開発開始前に必ず実行
source .env
echo "POSTGRES_URL: $POSTGRES_URL"
echo "POSTGRES_URL_NON_POOLING: $POSTGRES_URL_NON_POOLING"
```

### 3. **コード品質チェック**

```bash
# コミット前に必ず実行
pnpm check              # TypeScript + ESLint + Prettier
pnpm check:strict       # 厳密なチェック（推奨）
```

### 4. **依存関係の更新確認**

```bash
# 新しいパッケージ追加後
pnpm install
pnpm typecheck         # 型チェックでエラーがないか確認
```

## ⚠️ 指定されたら確認するルール

### 1. **データベース接続テスト**

```bash
# 接続に問題がある場合
pnpm prisma studio     # ブラウザで http://localhost:5555
```

### 2. **マイグレーション履歴の管理**

```bash
# 設計が固まったら本格的なマイグレーション開始
rm -rf prisma/migrations/     # 開発履歴を削除
pnpm prisma migrate dev --name production_ready_schema
```

### 3. **環境変数の再読み込み**

```bash
# 環境変数が反映されない場合
source .env
# または
export $(cat .env | xargs)
```

## 🚫 開発段階では避けるべきこと

### 1. **マイグレーション履歴の蓄積**

- 理由: DB設計が未確定で頻繁な変更が予想される
- 代わりに: `pnpm prisma db push` を使用

### 2. **本番環境でのテスト**

- 理由: 開発中の不安定なスキーマ
- 代わりに: ローカル環境 + Supabase開発環境

### 3. **複雑なリレーションの早期実装**

- 理由: 設計変更時の影響範囲が大きい
- 代わりに: シンプルな構造から段階的に拡張

## ✅ 推奨する開発フロー

### **日常的な開発サイクル**

1. スキーマ変更 → `pnpm prisma db push`
2. コード実装 → 型チェック
3. 動作確認 → Prisma Studio
4. 品質チェック → `pnpm check`
5. コミット

### **設計変更時**

1. 現在のスキーマをバックアップ
2. 新しいスキーマで `pnpm prisma db push`
3. 既存データの移行確認
4. アプリケーションの動作確認

## 🔧 トラブルシューティング

### **よくある問題と解決方法**

#### **環境変数が読み込まれない**

```bash
source .env
# または
export $(cat .env | xargs)
```

#### **Prismaクライアントエラー**

```bash
pnpm prisma generate
pnpm prisma db push
```

#### **データベース接続エラー**

```bash
# .envファイルの接続情報を確認
cat .env | grep POSTGRES_URL
```

## 📚 参考リンク

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 📝 更新履歴

- 2024/08/31: 初版作成
- 開発段階でのルールを定義
- マイグレーション履歴リセット方針を決定

---

**注意**: このルールは開発段階でのものです。本番環境投入前には適切なマイグレーション管理に移行してください。
