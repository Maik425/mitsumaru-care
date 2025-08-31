# 技術実装方針詳細設計書

## 📋 概要

みつまるケアシステムの認証・認可システムについて、技術的な実装方針を詳細に定義します。

## 🏗️ 1. アーキテクチャ設計

### 1.1 全体構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API   │    │   Supabase      │
│   (React)       │◄──►│   (tRPC)        │◄──►│   (Auth + DB)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Context  │    │   Auth Middleware│    │   RLS Policies  │
│   (State Mgmt)  │    │   (Permission)  │    │   (Data Access) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 レイヤー構成

#### プレゼンテーション層（Frontend）

```typescript
// 認証状態管理
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
}

// 認証コンテキスト
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダー
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    permissions: [],
  });

  // 認証状態の初期化
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, ...authActions }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### ビジネスロジック層（tRPC）

```typescript
// 認証ミドルウェア
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '認証が必要です',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// 権限チェックミドルウェア
export const createPermissionMiddleware = (requiredPermissions: Permission[]) =>
  authMiddleware.unstable_concat(
    t.middleware(async ({ ctx, next }) => {
      const hasPermission = await checkUserPermissions(
        ctx.user.id,
        requiredPermissions
      );

      if (!hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '権限が不足しています',
        });
      }

      return next({ ctx });
    })
  );
```

#### データアクセス層（Supabase）

```typescript
// 認証サービス
export class SupabaseAuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
```

## 🔧 2. Supabase Auth統合

### 2.1 環境設定

#### 環境変数

```bash
# .env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

#### Supabase設定

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// クライアントサイド用
export const createClientSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
};

// サーバーサイド用
export const createServerSupabaseClient = () => {
  return createServerSupabaseClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  });
};
```

### 2.2 認証フロー実装

#### ログインフロー

```typescript
// src/hooks/use-auth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientSupabaseClient();

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ユーザー情報の取得
      const userInfo = await fetchUserInfo(data.user.id);

      // 権限情報の取得
      const permissions = await fetchUserPermissions(data.user.id);

      setUser({
        ...data.user,
        ...userInfo,
        permissions,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};
```

#### セッション管理

```typescript
// src/lib/session.ts
export const initializeSession = async (): Promise<User | null> => {
  const supabase = createClientSupabaseClient();

  // 既存セッションの確認
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  // セッションの有効性確認
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // ユーザー情報の取得
  const userInfo = await fetchUserInfo(user.id);
  const permissions = await fetchUserPermissions(user.id);

  return {
    ...user,
    ...userInfo,
    permissions,
  };
};

export const refreshSession = async (): Promise<void> => {
  const supabase = createClientSupabaseClient();
  await supabase.auth.refreshSession();
};
```

## 🔐 3. 権限管理システム

### 3.1 権限チェック実装

#### 権限チェック関数

```typescript
// src/lib/permissions.ts
export const checkUserPermissions = async (
  userId: string,
  requiredPermissions: Permission[]
): Promise<boolean> => {
  try {
    const supabase = createServerSupabaseClient();

    const { data: userRoles, error } = await supabase
      .from('user_tenant_roles')
      .select(
        `
        role_id,
        roles (
          role_permissions (
            permissions (name)
          )
        )
      `
      )
      .eq('user_id', userId)
      .eq('is_active', true)
      .is('expires_at', null)
      .or('expires_at.gt', new Date().toISOString());

    if (error) throw error;

    const userPermissions = new Set<string>();

    userRoles.forEach(userRole => {
      userRole.roles.role_permissions.forEach(rolePermission => {
        userPermissions.add(rolePermission.permissions.name);
      });
    });

    return requiredPermissions.every(permission =>
      userPermissions.has(permission)
    );
  } catch (error) {
    console.error('権限チェックエラー:', error);
    return false;
  }
};
```

#### 権限キャッシュ

```typescript
// src/lib/permission-cache.ts
class PermissionCache {
  private cache = new Map<
    string,
    {
      permissions: Set<string>;
      expiresAt: number;
    }
  >();

  private readonly TTL = 5 * 60 * 1000; // 5分

  async getUserPermissions(userId: string): Promise<Set<string>> {
    const cached = this.cache.get(userId);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.permissions;
    }

    const permissions = await fetchUserPermissionsFromDB(userId);

    this.cache.set(userId, {
      permissions,
      expiresAt: Date.now() + this.TTL,
    });

    return permissions;
  }

  invalidateUser(userId: string): void {
    this.cache.delete(userId);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const permissionCache = new PermissionCache();
```

### 3.2 権限チェックフック

#### 権限チェックフック

```typescript
// src/hooks/use-permission.ts
export const usePermission = (requiredPermissions: Permission[]) => {
  const { user } = useAuth();

  const hasPermission = useMemo(() => {
    if (!user) return false;

    return requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );
  }, [user, requiredPermissions]);

  return hasPermission;
};

// 使用例
const UserManagementButton = () => {
  const canManageUsers = usePermission(['USER_MANAGEMENT']);

  if (!canManageUsers) return null;

  return (
    <Button onClick={handleUserManagement}>
      ユーザー管理
    </Button>
  );
};
```

## 🛡️ 4. セキュリティ実装

### 4.1 レート制限

#### レート制限ミドルウェア

```typescript
// src/lib/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const createRateLimit = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15分
    max: options.max || 100, // 最大リクエスト数
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: req => {
      // 特定のパスはスキップ
      return req.path.startsWith('/api/health');
    },
  });
};

// ログイン用の厳しいレート制限
export const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 最大5回
  message: {
    error: 'Too many login attempts, please try again later.',
  },
});
```

### 4.2 アカウントロック

#### ログイン失敗処理

```typescript
// src/lib/account-lock.ts
export const handleFailedLogin = async (email: string): Promise<void> => {
  const supabase = createServerSupabaseClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, failed_login_attempts, locked_until')
    .eq('email', email)
    .single();

  if (!user) return;

  const newAttempts = (user.failed_login_attempts || 0) + 1;
  const isLocked = newAttempts >= 5;
  const lockedUntil = isLocked
    ? new Date(Date.now() + 30 * 60 * 1000) // 30分
    : null;

  await supabase
    .from('users')
    .update({
      failed_login_attempts: newAttempts,
      locked_until: lockedUntil,
    })
    .eq('id', user.id);

  if (isLocked) {
    await logSecurityEvent({
      type: 'ACCOUNT_LOCKED',
      userId: user.id,
      reason: 'Too many failed login attempts',
      severity: 'MEDIUM',
    });
  }
};
```

### 4.3 CSRF対策

#### CSRFトークン生成・検証

```typescript
// src/lib/csrf.ts
import crypto from 'crypto';

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const validateCSRFToken = (
  token: string,
  sessionToken: string
): boolean => {
  const expectedToken = crypto
    .createHmac('sha256', process.env.CSRF_SECRET!)
    .update(sessionToken)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(expectedToken, 'hex')
  );
};

// CSRFミドルウェア
export const csrfMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.headers['authorization']?.replace('Bearer ', '');

  if (!token || !sessionToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  if (!validateCSRFToken(token, sessionToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};
```

## 📊 5. データベース設計

### 5.1 認証関連テーブル

#### ユーザーセッションテーブル

```sql
-- ユーザーセッション管理
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- セキュリティイベントログ
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255)
);

-- 監査トレイル
CREATE TABLE audit_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(20) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  reason TEXT
);
```

### 5.2 行レベルセキュリティ（RLS）

#### RLSポリシー

```sql
-- ユーザーセッションテーブルのRLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- セキュリティイベントログのRLS
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can view all security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tenant_roles utr
      WHERE utr.user_id = auth.uid()
      AND utr.role = 'SYSTEM_ADMIN'
    )
  );

CREATE POLICY "Facility admins can view facility security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tenant_roles utr
      WHERE utr.user_id = auth.uid()
      AND utr.role = 'FACILITY_ADMIN'
      AND utr.tenant_id = (
        SELECT tenant_id FROM users WHERE id = security_events.user_id
      )
    )
  );
```

## 🧪 6. テスト実装

### 6.1 認証テスト

#### 認証フローテスト

```typescript
// __tests__/auth/authentication.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/login-form';
import { AuthProvider } from '@/contexts/auth-context';

describe('認証フロー', () => {
  it('正しい認証情報でログインできる', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    });
  });

  it('無効な認証情報でエラーが表示される', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeInTheDocument();
    });
  });
});
```

### 6.2 権限テスト

#### 権限チェックテスト

```typescript
// __tests__/auth/permissions.test.ts
import { checkUserPermissions } from '@/lib/permissions';

describe('権限チェック', () => {
  it('システムアドミンは全権限を持つ', async () => {
    const hasPermission = await checkUserPermissions('system-admin-id', [
      'SYSTEM_SETTINGS',
      'TENANT_MANAGEMENT',
    ]);

    expect(hasPermission).toBe(true);
  });

  it('施設管理者は施設関連の権限を持つ', async () => {
    const hasFacilitySettings = await checkUserPermissions(
      'facility-admin-id',
      ['FACILITY_SETTINGS']
    );

    expect(hasFacilitySettings).toBe(true);
  });

  it('施設職員は制限された権限のみ持つ', async () => {
    const hasUserManagement = await checkUserPermissions('facility-staff-id', [
      'USER_MANAGEMENT',
    ]);

    expect(hasUserManagement).toBe(false);
  });
});
```

## 📊 7. 実装順序

### Phase 1: 基本認証システム（3-4日）

1. **Supabase Auth設定**
   - 環境変数の設定
   - 認証プロバイダーの設定
   - 基本的な認証フローの実装

2. **認証状態管理**
   - React Contextの実装
   - セッション管理の実装
   - ログイン・ログアウト機能の実装

### Phase 2: 権限管理システム（2-3日）

1. **権限チェック機能**
   - 権限チェック関数の実装
   - 権限キャッシュの実装
   - tRPC認証ミドルウェアの実装

2. **UI権限制御**
   - 権限チェックフックの実装
   - 条件付きレンダリングの実装
   - 権限エラーハンドリングの実装

### Phase 3: セキュリティ強化（2-3日）

1. **セキュリティ機能**
   - レート制限の実装
   - アカウントロックの実装
   - CSRF対策の実装

2. **監査・ログ**
   - セキュリティイベントログの実装
   - 監査トレイルの実装
   - ログ分析機能の実装

### Phase 4: テスト・最適化（1-2日）

1. **テスト実装**
   - 認証テストの実装
   - 権限テストの実装
   - セキュリティテストの実装

2. **パフォーマンス最適化**
   - 権限キャッシュの最適化
   - データベースクエリの最適化
   - フロントエンドパフォーマンスの最適化

---

**次のステップ**: [実装開始準備](./implementation-readiness.md) の作成
