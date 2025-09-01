# PR-005: Database Integration Tasks

このPRでは、PR-004で実装したスタブ処理を実際のPrisma接続に置き換え、シフト交換専用APIを新規作成します。

## 方針

- 既存UI・E2Eテストを維持しつつ、ダミー処理を実際のDB操作に置き換え
- シフト交換機能の専用ルーターを新規作成
- エラーハンドリングを実際のDB例外に対応

## タスク一覧

1. シフト交換専用ルーターの作成
   - `src/server/trpc/routers/shift-exchange.ts` を新規作成
   - `request`, `approve`, `reject`, `list`, `get` エンドポイントを実装
   - ルーターを `src/server/trpc/routers/index.ts` に追加

2. シフト作成のPrisma接続
   - `components/shift-create-form.tsx` のダミー処理を実際の `shifts.create` 呼び出しに置き換え
   - 入力データの適切な変換（日付形式、ユーザーID等）
   - エラーハンドリングの強化

3. シフト編集のPrisma接続
   - ダイアログ保存処理を実際の `shifts.update` 呼び出しに置き換え
   - シフトIDの適切な管理

4. 勤怠修正申請のPrisma接続
   - `components/user-attendance.tsx` のダミー処理を実際のAPI呼び出しに置き換え
   - 申請データの適切な保存

5. シフト交換申請・承認のPrisma接続
   - 申請・承認処理を実際のDB操作に置き換え
   - 申請状態の管理（pending, approved, rejected）

6. テストデータの準備
   - Prisma seed データの更新
   - テスト用のユーザー・シフト・申請データを追加

7. E2Eテストの安定化
   - 実際のDB操作に対応したテストの調整
   - テストデータのクリーンアップ処理

8. エラーハンドリングの強化
   - 実際のDB例外に対応したエラーメッセージ
   - バリデーションエラーの詳細化

9. ドキュメント更新
   - `docs/api/trpc-mapping.md` の実装状況を更新
   - 新規APIの使用方法を追加

実装順: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9
