# セキュリティ要件詳細設計書

## 📋 概要

みつまるケアシステムのセキュリティ要件について、詳細な設計と実装方針を定義します。

## 🔐 1. 認証セキュリティ

### 1.1 パスワードセキュリティ

#### パスワードポリシー

```typescript
interface PasswordPolicy {
  minLength: 8; // 最小8文字
  requireUppercase: true; // 大文字必須
  requireLowercase: true; // 小文字必須
  requireNumbers: true; // 数字必須
  requireSpecialChars: true; // 特殊文字必須
  maxAge: 90; // 90日で期限切れ
  historyCount: 3; // 過去3回のパスワードは再利用不可
  lockoutThreshold: 5; // 5回失敗でロック
  lockoutDuration: 30; // 30分間ロック
}
```

#### パスワードハッシュ化

```typescript
// Supabase Authのデフォルト設定を使用
// bcrypt with cost factor 12
const passwordHashConfig = {
  algorithm: 'bcrypt',
  costFactor: 12,
  saltRounds: 12,
};
```

### 1.2 セッションセキュリティ

#### セッション管理

```typescript
interface SessionConfig {
  maxAge: 8 * 60 * 60 * 1000;     // 8時間
  idleTimeout: 30 * 60 * 1000;    // 30分アイドル
  maxConcurrentSessions: 3;       // 最大3つの同時セッション
  secureCookies: true;             // HTTPS必須
  httpOnly: true;                  // JavaScriptアクセス不可
  sameSite: 'strict';              // CSRF対策
}
```

#### セッション無効化

```typescript
export const invalidateAllSessions = async (userId: string): Promise<void> => {
  // Supabase Authセッションの無効化
  await supabase.auth.admin.signOut(userId);

  // カスタムセッションテーブルのクリア
  await supabase.from('user_sessions').delete().eq('user_id', userId);

  // キャッシュのクリア
  permissionCache.invalidateUser(userId);
};
```

### 1.3 多要素認証（MFA）

#### TOTP認証

```typescript
interface MFAConfig {
  enabled: true;
  type: 'TOTP'; // Time-based One-Time Password
  issuer: 'Mitsumaru Care';
  algorithm: 'SHA1';
  digits: 6;
  period: 30; // 30秒間有効
  window: 1; // 前後1期間の許容
}

export const enableMFA = async (userId: string): Promise<MFAResult> => {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Mitsumaru Care TOTP',
    });

    if (error) throw error;

    return {
      success: true,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      backupCodes: data.backup_codes,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

## 🛡️ 2. 認可セキュリティ

### 2.1 権限チェック

#### リソースベースアクセス制御（RBAC）

```typescript
interface ResourceAccess {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export const checkResourceAccess = async (
  userId: string,
  resource: string,
  action: string,
  conditions?: Record<string, any>
): Promise<boolean> => {
  // 基本的な権限チェック
  const hasPermission = await checkUserPermissions(userId, [
    `${resource.toUpperCase()}_${action.toUpperCase()}`,
  ]);

  if (!hasPermission) return false;

  // 条件付きアクセス制御
  if (conditions) {
    return await checkConditionalAccess(userId, resource, conditions);
  }

  return true;
};
```

#### 条件付きアクセス制御

```typescript
export const checkConditionalAccess = async (
  userId: string,
  resource: string,
  conditions: Record<string, any>
): Promise<boolean> => {
  switch (resource) {
    case 'shift':
      return await checkShiftAccess(userId, conditions);
    case 'attendance':
      return await checkAttendanceAccess(userId, conditions);
    case 'user':
      return await checkUserAccess(userId, conditions);
    default:
      return true;
  }
};

// シフトアクセス制御例
const checkShiftAccess = async (
  userId: string,
  conditions: { facilityId?: string; shiftId?: string }
): Promise<boolean> => {
  const userRole = await getUserRole(userId);

  // システムアドミンは全施設アクセス可能
  if (userRole === 'SYSTEM_ADMIN') return true;

  // 施設管理者・職員は自施設のみアクセス可能
  if (conditions.facilityId) {
    const userFacility = await getUserFacility(userId);
    return userFacility === conditions.facilityId;
  }

  return true;
};
```

### 2.2 データフィルタリング

#### 行レベルセキュリティ（RLS）

```sql
-- ユーザーテーブルのRLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Facility admins can view facility users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tenant_roles utr
      WHERE utr.user_id = auth.uid()
      AND utr.role = 'FACILITY_ADMIN'
      AND utr.tenant_id = users.tenant_id
    )
  );

-- シフトテーブルのRLS
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view facility shifts" ON shifts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tenant_roles utr
      WHERE utr.user_id = auth.uid()
      AND utr.tenant_id = shifts.tenant_id
    )
  );
```

## 🚨 3. 攻撃対策

### 3.1 ブルートフォース攻撃対策

#### レート制限

```typescript
interface RateLimitConfig {
  windowMs: 15 * 60 * 1000;       // 15分間
  maxRequests: 100;                // 最大100リクエスト
  skipSuccessfulRequests: false;   // 成功リクエストもカウント
  skipFailedRequests: false;       // 失敗リクエストもカウント
}

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

#### アカウントロック

```typescript
export const handleFailedLogin = async (email: string): Promise<void> => {
  const { data: user } = await supabase
    .from('users')
    .select('id, failed_login_attempts, locked_until')
    .eq('email', email)
    .single();

  if (!user) return;

  const newAttempts = (user.failed_login_attempts || 0) + 1;
  const isLocked = newAttempts >= 5;
  const lockedUntil = isLocked ? new Date(Date.now() + 30 * 60 * 1000) : null;

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
    });
  }
};
```

### 3.2 セッションハイジャック対策

#### セッショントークンの保護

```typescript
interface TokenSecurity {
  algorithm: 'RS256'; // 非対称暗号化
  expiresIn: '8h'; // 8時間で期限切れ
  issuer: 'mitsumaru-care'; // 発行者
  audience: 'mitsumaru-care-app'; // 対象者
  jti: true; // JWT ID（再利用防止）
}

export const validateToken = async (
  token: string
): Promise<TokenValidation> => {
  try {
    // JWT署名の検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['RS256'],
      issuer: 'mitsumaru-care',
      audience: 'mitsumaru-care-app',
    });

    // トークンの再利用チェック
    const isUsed = await checkTokenUsage(decoded.jti);
    if (isUsed) {
      throw new Error('Token already used');
    }

    // 使用済みとしてマーク
    await markTokenAsUsed(decoded.jti);

    return {
      valid: true,
      payload: decoded,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
};
```

### 3.3 CSRF対策

#### CSRFトークン

```typescript
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
```

## 📊 4. 監査・ログ

### 4.1 セキュリティイベントログ

#### ログ構造

```typescript
interface SecurityEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  eventType: SecurityEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ROLE_CHANGE'
  | 'PERMISSION_GRANT'
  | 'PERMISSION_REVOKE'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'SUSPICIOUS_ACTIVITY';
```

#### ログ記録

```typescript
export const logSecurityEvent = async (
  event: Omit<SecurityEvent, 'id' | 'timestamp'>
): Promise<void> => {
  const securityEvent: SecurityEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };

  // データベースに記録
  await supabase.from('security_events').insert(securityEvent);

  // 高重要度イベントは即座に通知
  if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
    await notifySecurityTeam(securityEvent);
  }

  // 外部ログシステムへの送信
  await sendToExternalLogSystem(securityEvent);
};
```

### 4.2 監査トレイル

#### データ変更の追跡

```typescript
interface AuditTrail {
  id: string;
  timestamp: Date;
  userId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
}

export const createAuditTrail = async (
  userId: string,
  action: AuditTrail['action'],
  tableName: string,
  recordId: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  reason?: string
): Promise<void> => {
  const auditTrail: AuditTrail = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    userId,
    action,
    tableName,
    recordId,
    oldValues,
    newValues,
    reason,
  };

  await supabase.from('audit_trails').insert(auditTrail);
};
```

## 🔍 5. セキュリティテスト

### 5.1 自動化テスト

#### セキュリティテストケース

```typescript
describe('セキュリティテスト', () => {
  it('無効なトークンでアクセスを拒否する', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });

  it('権限のないリソースへのアクセスを拒否する', async () => {
    const user = await createTestUser('FACILITY_STAFF');
    const token = await generateToken(user);

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('CSRF攻撃を防ぐ', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('X-CSRF-Token', 'invalid-token');

    expect(response.status).toBe(403);
  });
});
```

### 5.2 ペネトレーションテスト

#### テスト計画

```typescript
interface PenetrationTestPlan {
  scope: string[];
  objectives: string[];
  methodology: string[];
  tools: string[];
  timeline: string;
  deliverables: string[];
}

const penetrationTestPlan: PenetrationTestPlan = {
  scope: [
    'Webアプリケーション',
    'APIエンドポイント',
    '認証システム',
    'データベース',
  ],
  objectives: [
    '認証・認可の脆弱性発見',
    'データ漏洩の可能性確認',
    'セッション管理の脆弱性確認',
    '入力値検証の脆弱性確認',
  ],
  methodology: [
    '情報収集',
    '脆弱性スキャン',
    '手動テスト',
    'エクスプロイト',
    'レポート作成',
  ],
  tools: ['OWASP ZAP', 'Burp Suite', 'Nmap', 'SQLMap'],
  timeline: '2週間',
  deliverables: ['技術レポート', 'リスク評価', '修正提案', '再テスト結果'],
};
```

## 📊 6. 実装順序

### Phase 1: 基本セキュリティ（2-3日）

1. パスワードポリシーの実装
2. セッション管理の実装
3. 基本的な権限チェックの実装

### Phase 2: 攻撃対策（2-3日）

1. レート制限の実装
2. アカウントロックの実装
3. CSRF対策の実装

### Phase 3: 監査・ログ（1-2日）

1. セキュリティイベントログの実装
2. 監査トレイルの実装
3. セキュリティテストの実装

---

**次のステップ**: [技術実装方針詳細化](./technical-implementation.md) の作成
