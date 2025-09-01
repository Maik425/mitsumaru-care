# PR-004: 受け入れ基準

## 機能面

- 既存UI（`docs/ui/README.md`）の見た目・文言を保ったまま、内部処理がAPI連携に切り替わっている
- オフライン/ネットワークエラー時、現行と同一のメッセージが表示される
- ロールガードにより不正アクセス時はトップへリダイレクト（現仕様踏襲）

## テスト面

- `e2e/shift-management.spec.ts` 全テストがグリーンのまま維持
- 既存の `auth-flow.spec.ts`, `navigation.spec.ts` に影響を与えない（回帰なし）
- 主要操作のセレクタは `data-testid` または ラベル/ロールで一意に特定可能

## 実装面

- tRPCクライアント層が単一のエントリポイントから利用可能
- API呼び出しの結果/例外を共通関数で処理（UIのメッセージ仕様を維持）
- 主要エンドポイント（create/update/correction/exchange）は最低限のスタブが存在

## ドキュメント

- `docs/api/trpc-mapping.md` に実装状態（スタブ/実装済）を反映
- `docs/development/implementation-tasks/pr-004-system-integration/tasks.md` が実装内容と合致
