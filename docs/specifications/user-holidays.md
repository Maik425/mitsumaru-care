# 希望休申請ページ (@user-holidays.tsx) 仕様整理

## 背景

- 一般職スタッフが希望休や交換希望申請を行う専用画面
- 現在はダミーデータのままで、バックエンドと未連携
- `/user/dashboard` にリンクされており、他ページと同様に `UserShell` レイアウトを使用

## 画面構成

1. **コンテキスト情報**
   - タイトル: 希望休申請
   - 説明文: 「希望休や交換希望の申請・履歴を確認できます」
   - `UserShell` によりサイドバー（ダッシュボード、勤怠申請、希望休申請、FAQ、ログアウト）を表示

2. **期限切れ警告カード**
   - 現在日時と毎月 20 日の期限を比較し、期限超過時に表示
   - 来月分の提出期限（20 日）と該当ターゲット月を表示
   - 交換希望申請の利用を促すメッセージ

3. **左カラム**
   - **新しい休暇申請**
     - 来月以降の希望日を追加（複数）
     - 選択済み日付の表示と削除ボタン
     - 理由入力は不要（注意書きのみ）
     - 送信ボタン（選択日が 1 件以上必須）
   - **交換希望申請**
     - 今月（期限超過時は来月分も）の日付を追加可能
     - 任意の理由記入欄あり
     - 選択済み日付の表示と削除
     - 送信ボタン（選択日が 1 件以上必須）

4. **右カラム**
   - **申請履歴**
     - 過去申請（希望休・交換希望）を一覧表示
     - 各申請の情報:
       - 日付一覧
       - 申請日
       - ステータス（承認済み/却下/承認待ち）バッジ
       - 申請種別バッジ（希望休/交換希望）
       - 承認済みの場合の承認日・却下理由など

## 現状実装の問題点

- `myRequests` による固定データ表示のみ
- 新規申請は `console.log` に出力するだけで保存されない
- Supabase / tRPC 連携が未実装

## 今後のバックエンド実装方針

1. **Supabase スキーマ追加**
   - 新テーブル `holiday_requests` を作成
   - カラム例: `id`, `user_id`, `type`, `dates (date[])`, `submitted_at`, `status`, `reason`, `reject_reason`, `approved_at`
   - RLS: `user_id = auth.uid()` のユーザーだけが自分の申請を閲覧・登録可能に

2. **Repository 層** (`src/lib/repositories/holiday.repository.ts` など)
   - `createHolidayRequest`
   - `getHolidayRequests`（フィルタ: ユーザー、ステータスなど）

3. **tRPC ルータ** (`holidayRouter`)
   - `createHolidayRequest`
   - `getHolidayRequests`
   - バリデーション: Zod を利用しフロントの制約と整合性をとる

4. **フロントエンド連携**
   - `api.holidays.create` mutation で新規申請
   - `api.holidays.list` query で履歴取得
   - 成功時に React Query のキャッシュを無効化し UI 更新

5. **追加要件**
   - 交換希望で複数日を扱うため `dates` を配列で扱う
   - バックエンドでも日付バリデーション（来月以降 / 今月のみなど）を実施
   - 将来的に承認・却下処理や施設管理者画面からも利用する可能性がある

## 次ステップ

1. `003_holiday_requests_schema.sql` Migration 作成
2. Repository / tRPC 実装
3. `user-holidays.tsx` 側の mutation/query を差し替え
4. E2E 動作確認（申請 → 履歴反映）

