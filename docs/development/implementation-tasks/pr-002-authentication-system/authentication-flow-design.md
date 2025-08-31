# 認証フロー詳細設計書

## 📋 概要

みつまるケアシステムの認証フローについて、詳細な設計と実装方針を定義します。

## 🔐 認証フロー全体図

```
ユーザー → ログイン画面 → 認証処理 → 権限チェック → ダッシュボード
   ↓           ↓           ↓         ↓         ↓
ゲスト状態   認証情報入力   Supabase   RBAC     認証済み
           バリデーション   Auth     チェック   ユーザー
```

## 🎯 1. ログインフローの設計

### 1.1 基本フロー

1. **初期状態**
   - ユーザーがログイン画面にアクセス
   - 既存セッションの確認
   - セッション有効時は自動リダイレクト

2. **認証情報入力**
   - メールアドレス入力（必須）
   - パスワード入力（必須）
   - 入力値のバリデーション

3. **認証処理**
   - Supabase Authによる認証
   - エラーハンドリング
   - ローディング状態の表示

4. **認証成功後の処理**
   - ユーザー情報の取得
   - 権限情報の取得
   - 適切なダッシュボードへのリダイレクト

### 1.2 エラーハンドリング

#### 認証エラー

```typescript
interface AuthError {
  type: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  code?: string;
  retryCount?: number;
}
```

#### エラーケース

- **無効な認証情報**: メールアドレスまたはパスワードが間違っている
- **アカウントロック**: ログイン試行回数超過
- **ネットワークエラー**: サーバー接続エラー
- **アカウント無効**: 管理者によるアカウント停止

### 1.3 バリデーション

#### メールアドレス

```typescript
const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return {
    isValid,
    errors: isValid ? [] : ['有効なメールアドレスを入力してください'],
  };
};
```

#### パスワード

```typescript
const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を含む必要があります');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('小文字を含む必要があります');
  }

  if (!/\d/.test(password)) {
    errors.push('数字を含む必要があります');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('特殊文字を含む必要があります');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

## 🚪 2. ログアウトフローの設計

### 2.1 基本フロー

1. **ログアウトリクエスト**
   - ユーザーがログアウトボタンをクリック
   - 確認ダイアログの表示

2. **セッション終了処理**
   - Supabase Authセッションの終了
   - ローカルストレージのクリア
   - キャッシュのクリア

3. **リダイレクト処理**
   - ログイン画面へのリダイレクト
   - ログアウト完了メッセージの表示

### 2.2 セキュリティ考慮事項

- **トークン無効化**: JWTトークンの即座無効化
- **セッションクリア**: ブラウザセッションの完全クリア
- **キャッシュクリア**: 認証関連データの完全削除

## 📝 3. ユーザー登録フローの設計

### 3.1 基本フロー

1. **登録情報入力**
   - メールアドレス入力
   - パスワード入力
   - パスワード確認入力
   - 利用規約同意

2. **登録処理**
   - 入力値のバリデーション
   - Supabase Authによるユーザー作成
   - 初期権限の設定

3. **確認処理**
   - メール確認の送信
   - 確認完了後のログイン

### 3.2 初期権限設定

```typescript
const setInitialUserRole = async (userId: string): Promise<void> => {
  // デフォルトは一般職権限
  await supabase.from('user_tenant_roles').insert({
    userId,
    tenantId: 'default',
    role: 'USER',
    status: 'ACTIVE',
  });
};
```

## 🔒 4. セキュリティ要件

### 4.1 パスワードポリシー

- **最小長**: 8文字以上
- **文字種**: 大文字・小文字・数字・特殊文字を含む
- **履歴**: 過去3回のパスワードは再利用不可
- **有効期限**: 90日で期限切れ

### 4.2 ログイン試行制限

- **最大試行回数**: 5回
- **ロック時間**: 30分
- **ロック解除**: 管理者による手動解除または時間経過

### 4.3 セッション管理

- **セッションタイムアウト**: 8時間
- **アイドルタイムアウト**: 30分
- **同時セッション**: 最大3つまで

## 📱 5. UI/UX要件

### 5.1 ログイン画面

- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **アクセシビリティ**: スクリーンリーダー対応
- **エラー表示**: 分かりやすいエラーメッセージ
- **ローディング状態**: 処理中の視覚的フィードバック

### 5.2 ダッシュボード

- **認証状態表示**: ユーザー名・ロールの表示
- **ログアウトボタン**: 分かりやすい配置
- **権限制御**: 権限に応じたUI要素の表示/非表示

## 🔧 6. 技術実装方針

### 6.1 Supabase Auth統合

```typescript
// 認証サービスの基本構造
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async login(email: string, password: string): Promise<AuthResult> {
    // 実装詳細
  }

  async logout(): Promise<void> {
    // 実装詳細
  }

  async register(email: string, password: string): Promise<AuthResult> {
    // 実装詳細
  }
}
```

### 6.2 React Context統合

```typescript
// 認証コンテキストの基本構造
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
```

## 📊 7. 実装順序

### Phase 1: 基本認証（1-2日）

1. Supabase Authの設定
2. 基本的なログイン・ログアウト機能
3. 認証状態管理の実装

### Phase 2: セキュリティ強化（1-2日）

1. パスワードポリシーの実装
2. ログイン試行制限の実装
3. セッション管理の実装

### Phase 3: ユーザー登録（1日）

1. ユーザー登録フローの実装
2. 初期権限設定の実装
3. メール確認の実装

## 🧪 8. テスト計画

### 8.1 単体テスト

- 認証サービスのテスト
- バリデーション関数のテスト
- エラーハンドリングのテスト

### 8.2 統合テスト

- ログインフローのテスト
- ログアウトフローのテスト
- セッション管理のテスト

### 8.3 セキュリティテスト

- パスワードポリシーのテスト
- ログイン試行制限のテスト
- セッションタイムアウトのテスト

---

**次のステップ**: [権限モデル設計](./role-model-design.md) の作成
