# テストユーザー情報

このドキュメントには、Playwrightテストで使用するテストユーザーの情報が記載されています。

## テストユーザー一覧

### システム管理者

- **Email**: `admin@mitsumaru-care.com`
- **Password**: `password123`
- **Role**: `system_admin`
- **User ID**: `b9866da3-c6fa-40a5-a02a-89b303a162e2`
- **Name**: `システム管理者`
- **Status**: `active`

### 施設管理者

- **Email**: `facility1@mitsumaru-care.com`
- **Password**: `password123`
- **Role**: `facility_admin`
- **User ID**: `a3466255-df5e-4503-a9d7-c1c618657d65`
- **Name**: `施設管理者1`
- **Status**: `active`

### 一般ユーザー

- **Email**: `user1@mitsumaru-care.com`
- **Password**: `password123`
- **Role**: `user`
- **User ID**: `28b050bf-c246-4fd5-ad03-a1247bf90f83`
- **Name**: `職員1`
- **Status**: `active`

## テスト作成時の注意事項

1. **ログイン前の確認**:
   - テストユーザーが存在することを確認
   - ユーザーがアクティブ状態であることを確認
   - 正しい認証情報を使用していることを確認

2. **ログイン処理**:
   - ログインフォームが表示されるまで待つ
   - 正しいセレクターを使用してフォームを入力
   - ログイン後のリダイレクトを適切に待つ

3. **エラーハンドリング**:
   - ログインに失敗した場合は詳細なエラーメッセージを出力
   - 現在のURLとエラー内容を確認
   - 必要に応じてスクリーンショットを取得

## テストユーザーの作成・更新

テストユーザーは `scripts/create-test-users.js` で作成・更新できます。

```bash
node scripts/create-test-users.js
```

## データベースでの確認

テストユーザーの情報は以下のSQLで確認できます：

```sql
SELECT id, email, name, role, is_active FROM users ORDER BY role;
```
