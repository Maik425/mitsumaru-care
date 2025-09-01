# PR-005: Database Integration

## 概要

PR-004で実装したスタブ処理を実際のPrisma接続に置き換え、シフト交換専用APIを新規作成します。

## 目標

- 既存UI・E2Eテストを維持しつつ、ダミー処理を実際のDB操作に置き換え
- シフト交換機能の専用ルーターを新規作成
- エラーハンドリングを実際のDB例外に対応

## 主要変更

### 1. シフト交換専用ルーター

- `src/server/trpc/routers/shift-exchange.ts` を新規作成
- 申請・承認・却下・一覧・詳細取得のエンドポイントを実装

### 2. Prisma接続

- シフト作成・編集の実際のDB操作
- 勤怠修正申請のDB保存
- シフト交換申請・承認のDB管理

### 3. テストデータ管理

- Prisma seed データの更新
- E2Eテスト用データの準備

## 実装順序

1. シフト交換専用ルーターの作成
2. シフト作成のPrisma接続
3. シフト編集のPrisma接続
4. 勤怠修正申請のPrisma接続
5. シフト交換申請・承認のPrisma接続
6. テストデータの準備
7. E2Eテストの安定化
8. エラーハンドリングの強化
9. ドキュメント更新

## 関連ファイル

- `src/server/trpc/routers/shift-exchange.ts` (新規)
- `components/shift-create-form.tsx` (更新)
- `components/user-attendance.tsx` (更新)
- `app/user/shift-exchange/page.tsx` (更新)
- `app/admin/shift-exchange/page.tsx` (更新)
- `prisma/schema.prisma` (更新)
- `prisma/seed.ts` (更新)
