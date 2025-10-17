<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AGENTS.md

このドキュメントは、AIエージェントがこのプロジェクトで作業する際のガイドラインです。

## プロジェクト構造

このプロジェクトは`src`ディレクトリ構造を使用しています：

```
mitsumaru-care/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── system/    # システム管理者向けページ
│   │   ├── facility/  # 施設管理者向けページ（旧admin）
│   │   ├── user/      # 一般ユーザー向けページ
│   │   ├── api/       # API ルート
│   │   ├── layout.tsx # ルートレイアウト
│   │   └── page.tsx   # ホームページ
│   ├── components/    # Reactコンポーネント
│   │   ├── ui/        # shadcn/ui コンポーネント
│   │   └── *.tsx      # カスタムコンポーネント
│   ├── lib/          # ユーティリティ関数
│   ├── hooks/        # カスタムフック
│   └── styles/       # スタイルファイル
├── public/           # 静的ファイル（画像、アイコンなど）
├── tsconfig.json     # TypeScript設定
├── next.config.mjs   # Next.js設定
└── package.json      # 依存関係
```

## 開発フロー

### コード修正後の必須手順

**すべてのコード修正後は、必ず以下のコマンドを実行してください：**

```bash
pnpm exec tsc
```

このコマンドにより、TypeScriptの型エラーがないことを確認できます。

### 推奨される作業手順

1. **修正前の確認**

   ```bash
   pnpm exec tsc
   ```

2. **コードの修正**
   - ファイルの編集
   - 新しいコンポーネントの追加
   - 既存コンポーネントの修正

3. **修正後の確認**

   ```bash
   pnpm exec tsc
   ```

4. **エラーがある場合**
   - TypeScriptエラーを修正
   - 再度 `pnpm exec tsc` を実行
   - エラーが解消されるまで繰り返し

## 重要な設定

### TypeScript設定

- `@/*` エイリアスは `./src/*` を指します
- 厳密な型チェックが有効になっています

### Next.js設定

- App Routerを使用
- TypeScriptエラーは無視されません（開発時は確認が重要）

### コンポーネント

- shadcn/ui を使用
- カスタムコンポーネントは `src/components/` に配置
- UIコンポーネントは `src/components/ui/` に配置

## 注意事項

1. **インポートパス**: `@/components/...` 形式でインポートしてください
2. **型安全性**: すべてのコンポーネントで適切な型定義を使用してください
3. **エラーハンドリング**: TypeScriptエラーは必ず修正してください
4. **ファイル構造**: 新しいファイルは適切なディレクトリに配置してください
5. **ドキュメント更新**: 機能実装後は必ず `docs/PR/` ディレクトリのドキュメントを更新してください
6. **tasks.md更新**: 実装完了後は必ず `openspec/changes/*/tasks.md` を更新して完了タスクをマークしてください

## データアクセス層の方針

Supabase を「認証サービス」と「PostgreSQL データベース」として利用しつつ、アプリケーションコードはデータストア実装へ密結合しないようにします。

- **抽象化されたデータソース**: `src/data/**` にインターフェース（例: `AttendanceDataSource`）を定義し、アプリケーションからはこの抽象に依存するよう実装します。現在は Supabase 版 (`SupabaseAttendanceDataSource`) を提供していますが、将来は他サービスに差し替え可能です。
- **リポジトリ層の分離**: tRPC ルーターや React コンポーネントからは `AttendanceRepository` などのリポジトリを介してデータにアクセスします。リポジトリはデータソースを注入することで、Supabase 以外の実装にも対応しやすくなっています。
- **Supabase 固有ロジックの集约**: Supabase のクエリ、RPC、RLS 前提の処理は Supabase 用データソース内に閉じ込めます。アプリケーションの他の層では Supabase を直接参照しません。
- **型／DTO の共通化**: `src/lib/dto/**` に定義したドメインスキーマを基準に、データソース・リポジトリが同じ型を共有します。これによりバックエンドが変わっても型契約を維持しやすくなります。
- **Auth について**: 認証フロー（`useAuth` や Supabase Auth）は現状のまま Supabase を利用します。将来的に認証を差し替える際も、data 層の構造が独立しているため段階的な移行が可能です。

## 将来の拡張

このプロジェクトはtRPCサーバーと認証システムを統合済みです：

```
src/
├── app/           # Next.js App Router
│   ├── system/    # システム管理者向けページ
│   ├── facility/  # 施設管理者向けページ
│   ├── user/      # 一般ユーザー向けページ
│   └── api/       # API ルート
├── components/    # Reactコンポーネント
├── lib/          # ユーティリティ関数
├── hooks/        # カスタムフック
├── server/       # tRPCサーバー
└── styles/       # スタイルファイル
```

## データベースマイグレーション

### マイグレーションファイルの作成ルール

1. **ファイル名**: `supabase/migrations/001_initial_schema.sql` 形式
2. **日時は不要**: ファイル名に日時を含めない
3. **まとめて作成**: 関連するテーブルは1つのマイグレーションファイルにまとめる
4. **順序**: 依存関係を考慮してテーブル作成順序を決める
5. **ダミーデータ**: 必要に応じて同じファイルにINSERT文を含める

### マイグレーション実行手順

1. マイグレーションファイルをSupabaseにアップロード
2. マイグレーションを実行（自動的にリセットとセットアップが実行されます）
3. データの確認

#### ローカル/リモート環境でのマイグレーション実行例

```bash
# .envに定義されたURLを使ってSupabaseにマイグレーションを反映
pnpm exec supabase db push --db-url "postgresql://postgres:Rn1jsdnsEnYKABV5@db.xuojlhzkzzjgguacmdly.supabase.co:5432/postgres"
```

#### tRPC APIのcurlテスト手順

1. `.env` から Supabase 認証用の変数を読み込む（`NEXT_PUBLIC_SUPABASE_*` など）

   ```bash
   export $(cat .env | xargs)
   ```

2. Supabase 認証APIからアクセス・リフレッシュトークンを取得

   ```bash
   curl -s -H "Content-Type: application/json" \
     -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     -d '{"email":"user@mitsumaru.com","password":"asdfasdf"}' \
     "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password" \
     > /tmp/supabase_session.json
   export ACCESS_TOKEN=$(jq -r '.access_token' /tmp/supabase_session.json)
   ```

3. `holidays.list` の取得

   ```bash
   curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
     "http://localhost:3000/api/trpc/holidays.list?batch=1&input=%7B%7D"
   ```

4. `holidays.create` で新規申請を作成（`reason` は未入力時 `null` を許容）

   ```bash
   curl -s -X POST "http://localhost:3000/api/trpc/holidays.create" \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"type":"regular","dates":["2025-12-01","2025-12-02"],"reason":null}'
   ```

5. 作成後に再度 `holidays.list` を実行して反映を確認
   ```bash
   curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
     "http://localhost:3000/api/trpc/holidays.list?batch=1&input=%7B%7D"
   ```

**注意**: `001_initial_schema.sql`には完全なリセット機能が含まれています：

- 既存テーブルの削除
- Authenticationユーザーの削除
- 新しいスキーマの作成
- テーブル、RLSポリシー、ダミーデータの作成

### データベース接続情報

**重要**: データベースパスワードや接続情報が必要な場合は、以下のファイルを確認してください：

```bash
cat confidential/supabase-connection.env
```

このファイルにはSupabaseデータベースの接続情報が保存されています。

- ファイルは`confidential/`ディレクトリにあり、`.gitignore`に含まれており、gitにはコミットされません

## トラブルシューティング

### TypeScriptエラーが発生した場合

1. `pnpm exec tsc` でエラーを確認
2. エラーメッセージを読んで問題を特定
3. 型定義やインポートパスを修正
4. 再度 `pnpm exec tsc` で確認

### ビルドエラーが発生した場合

1. `.next` ディレクトリを削除: `rm -rf .next`
2. `pnpm exec tsc` で型エラーを確認
3. エラーを修正後、再度ビルドを試行

---

**重要**: すべてのコード修正後は必ず `pnpm exec tsc` を実行して、TypeScriptエラーがないことを確認してください。

## OpenSpec コマンド（ショートカット）

以下のコマンドは、このプロジェクトでのOpenSpec運用における作業ショートカットです。

```bash
# 変更提案（プロポーザル）の作成・検証
/openspec-proposal

# 提案の適用（実装開始・タスク着手）
/openspec-apply

# 提案のアーカイブ（デプロイ後の整理）
/openspec-archive
```

実際のCLI操作は `openspec/AGENTS.md` を参照してください（`openspec list`, `openspec validate --strict`, `openspec archive` など）。
