# AGENTS.md

このドキュメントは、AIエージェントがこのプロジェクトで作業する際のガイドラインです。

## プロジェクト構造

このプロジェクトは`src`ディレクトリ構造を使用しています：

```
mitsumaru-care/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── admin/     # 管理者向けページ
│   │   ├── user/      # ユーザー向けページ
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

## 将来の拡張

このプロジェクトは将来的にtRPCサーバーを統合する予定です：

```
src/
├── app/           # Next.js App Router
├── components/    # Reactコンポーネント
├── lib/          # ユーティリティ関数
├── hooks/        # カスタムフック
├── server/       # tRPCサーバー（将来追加予定）
└── styles/       # スタイルファイル
```

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
