# PR-004: System Integration Tasks

このPRでは、既存UIに最小限の変更で、実運用に向けた統合を段階的に進めます。UIは`docs/ui/README.md`の設計・実装状況に準拠し、E2Eを崩さないことを前提とします。

## 方針

- 既存UIを維持しつつ、内部を段階的にtRPC/APIへ接続
- オフライン/ネットワークエラーは現在のUIメッセージ仕様を踏襲
- data-testid とラベルを維持/追加し、E2E安定性を最優先

## タスク一覧

1. 最小tRPCクライアント層の導入（UI変更なし）
   - `src/lib/trpcClient.ts`（既存があれば流用）を整理し、クライアント生成
   - 共通のエラーハンドリングポリシー（トースト/DOMメッセージ）を関数化

2. シフト作成フローのAPI接続（フェーズ1: ダミー→フェーズ2: Prisma）
   - `components/shift-create-form.tsx`の保存処理をtRPC `shifts.create` へ置換（オフライン時は現行メッセージを継続）
   - 返却値からメッセージ「シフトが生成されました」を維持
   - 既存`data-testid`やラベルを変更せず内部のみ差し替え

3. シフト編集・調整の保存処理をAPI接続
   - ダイアログ内の保存`detail-save-button`で `shifts.update` を呼び出し（実体はダミー→後日DB）
   - UIのトースト/メッセージ仕様を維持

4. 勤怠修正申請の送信処理をAPI接続
   - `components/user-attendance.tsx`の申請送信を `attendance.submitCorrection` に
   - 申請完了メッセージは既存の表示仕様を維持

5. シフト交換 申請/承認のAPIスタブ連携
   - `app/user/shift-exchange/page.tsx` 申請→ `shiftExchange.request`
   - `app/admin/shift-exchange/page.tsx` 承認→ `shiftExchange.approve`
   - UIは現状の簡易トーストのまま

6. 権限ガードの強化（UI変更なし）
   - `app/admin/*`, `app/user/*` でロールチェックを `src/lib/auth` に集約
   - 現行の `localStorage` モックを存置し、切替ポイントを1箇所に

7. オフライン時のフォールバック標準化
   - SWハンドリングの文言・表示位置を関数化し、`シフト作成`等で使い回し
   - 既存E2Eが依存するメッセージ文言は変更しない

8. E2Eの安定化・維持
   - URLの正規表現マッチと`data-testid`の監査
   - Playwright strict modeに抵触しないよう重複見出し/ボタンの検証

9. ドキュメント更新
   - `docs/api/trpc-mapping.md`に実装済み/スタブの状態を反映
   - `docs/ui/README.md`の「次に実装が必要な部分」を最新化

---

実装順の目安: 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9（E2Eが崩れない単位で小さくマージ）
