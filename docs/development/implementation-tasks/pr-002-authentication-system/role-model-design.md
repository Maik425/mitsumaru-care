# 権限モデル詳細設計書

## 📋 概要

みつまるケアシステムの権限モデルについて、詳細な設計と実装方針を定義します。

## 🏗️ 権限モデル全体図

```
ユーザー (User)
    ↓
ユーザーテナントロール (UserTenantRole)
    ↓
ロール (Role)
    ↓
権限 (Permission)
    ↓
リソース (Resource)
```

## 👥 1. ユーザーロールの定義

### 1.1 基本ロール

#### システムアドミン (SYSTEM_ADMIN)

```typescript
interface SystemAdminRole {
  name: 'SYSTEM_ADMIN';
  permissions: [
    'SYSTEM_SETTINGS', // システム設定
    'TENANT_MANAGEMENT', // テナント管理
    'USER_MANAGEMENT', // ユーザー管理
    'ROLE_MANAGEMENT', // ロール管理
    'SYSTEM_REPORTS', // システムレポート
    'AUDIT_LOG_VIEW', // 監査ログ閲覧
    'BACKUP_RESTORE', // バックアップ・リストア
    'SYSTEM_MONITORING', // システム監視
  ];
}
```

#### 施設管理者 (FACILITY_ADMIN)

```typescript
interface FacilityAdminRole {
  name: 'FACILITY_ADMIN';
  permissions: [
    'FACILITY_SETTINGS', // 施設設定
    'USER_MANAGEMENT', // ユーザー管理
    'SHIFT_MANAGEMENT', // シフト管理
    'ROLE_MANAGEMENT', // ロール管理
    'ATTENDANCE_MANAGEMENT', // 勤怠管理
    'REPORT_GENERATION', // レポート生成
    'DATA_EXPORT', // データエクスポート
    'FACILITY_REPORTS', // 施設レポート
    'NOTIFICATION_MANAGEMENT', // 通知管理
  ];
}
```

#### 施設職員 (FACILITY_STAFF)

```typescript
interface FacilityStaffRole {
  name: 'FACILITY_STAFF';
  permissions: [
    'SHIFT_VIEW', // シフト閲覧
    'ATTENDANCE_UPDATE', // 勤怠更新
    'HOLIDAY_REQUEST', // 休暇申請
    'PROFILE_UPDATE', // プロフィール更新
    'NOTIFICATION_VIEW', // 通知閲覧
    'SHIFT_EXCHANGE_REQUEST', // シフト交換申請
    'WORK_SCHEDULE_VIEW', // 勤務スケジュール閲覧
  ];
}
```

### 1.2 カスタムロール

```typescript
interface CustomRole {
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 2. 権限チェックの実装方針

### 2.1 ページレベルでの権限チェック

#### 認証ガードコンポーネント

```typescript
interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions,
  fallback = <AccessDenied />
}) => {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!hasPermission(requiredPermissions)) {
    return fallback;
  }

  return <>{children}</>;
};
```

#### 使用例

```typescript
// 管理者のみアクセス可能
<AuthGuard requiredPermissions={['USER_MANAGEMENT']}>
  <UserManagementPage />
</AuthGuard>

// 一般職以上アクセス可能
<AuthGuard requiredPermissions={['SHIFT_VIEW']}>
  <ShiftViewPage />
</AuthGuard>
```

### 2.2 APIレベルでの権限チェック

#### tRPC認証ミドルウェア

```typescript
// 認証が必要なプロシージャ
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
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
  })
);

// 特定の権限が必要なプロシージャ
export const createPermissionProcedure = (requiredPermissions: Permission[]) =>
  protectedProcedure.use(
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

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    })
  );
```

#### 使用例

```typescript
// ユーザー管理API（管理者のみ）
export const userRouter = router({
  create: createPermissionProcedure(['USER_MANAGEMENT']).mutation(
    async ({ input, ctx }) => {
      // ユーザー作成ロジック
    }
  ),

  list: createPermissionProcedure(['USER_MANAGEMENT']).query(
    async ({ ctx }) => {
      // ユーザー一覧取得ロジック
    }
  ),
});
```

### 2.3 UI要素レベルでの権限チェック

#### 権限チェックフック

```typescript
export const usePermission = (requiredPermissions: Permission[]) => {
  const { user } = useAuth();

  const hasPermission = useMemo(() => {
    if (!user) return false;
    return checkUserPermissions(user.id, requiredPermissions);
  }, [user, requiredPermissions]);

  return hasPermission;
};
```

#### 使用例

```typescript
const UserManagementButton = () => {
  const canManageUsers = usePermission(['USER_MANAGEMENT']);

  if (!canManageUsers) {
    return null;
  }

  return (
    <Button onClick={handleUserManagement}>
      ユーザー管理
    </Button>
  );
};
```

## 🔄 3. 権限管理の実装方針

### 3.1 ロールの動的変更

#### ロール変更API

```typescript
interface UpdateUserRoleRequest {
  userId: string;
  newRole: string;
  reason: string;
  updatedBy: string;
}

export const updateUserRole = async (
  request: UpdateUserRoleRequest
): Promise<void> => {
  // 権限チェック
  if (!hasPermission(request.updatedBy, ['ROLE_MANAGEMENT'])) {
    throw new Error('権限が不足しています');
  }

  // ロール変更
  await supabase
    .from('user_tenant_roles')
    .update({
      role: request.newRole,
      updatedAt: new Date(),
      updatedBy: request.updatedBy,
    })
    .eq('userId', request.userId);

  // 監査ログ記録
  await logRoleChange(request);
};
```

### 3.2 権限の継承

#### 階層的権限システム

```typescript
interface RoleHierarchy {
  SYSTEM_ADMIN: ['FACILITY_ADMIN', 'FACILITY_STAFF'];
  FACILITY_ADMIN: ['FACILITY_STAFF'];
  FACILITY_STAFF: [];
}

const getInheritedPermissions = (role: string): Permission[] => {
  const basePermissions = getRolePermissions(role);
  const inheritedRoles = getInheritedRoles(role);

  const inheritedPermissions = inheritedRoles.flatMap(inheritedRole =>
    getRolePermissions(inheritedRole)
  );

  return [...new Set([...basePermissions, ...inheritedPermissions])];
};
```

### 3.3 権限の一時的な付与

#### 一時権限システム

```typescript
interface TemporaryPermission {
  id: string;
  userId: string;
  permission: Permission;
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date;
  reason: string;
}

export const grantTemporaryPermission = async (
  request: Omit<TemporaryPermission, 'id' | 'grantedAt'>
): Promise<void> => {
  // 権限チェック
  if (!hasPermission(request.grantedBy, ['PERMISSION_MANAGEMENT'])) {
    throw new Error('権限が不足しています');
  }

  // 一時権限の付与
  await supabase.from('temporary_permissions').insert({
    ...request,
    grantedAt: new Date(),
  });
};
```

## 🗄️ 4. データベース設計

### 4.1 権限テーブル

```sql
-- 権限テーブル
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ロールテーブル
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ロール権限関連テーブル
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- ユーザーロール関連テーブル
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 初期データ

```sql
-- 基本権限の挿入
INSERT INTO permissions (name, description, resource, action) VALUES
('USER_MANAGEMENT', 'ユーザー管理', 'user', 'manage'),
('SYSTEM_SETTINGS', 'システム設定', 'system', 'manage'),
('SHIFT_MANAGEMENT', 'シフト管理', 'shift', 'manage'),
('SHIFT_VIEW', 'シフト閲覧', 'shift', 'view'),
('ATTENDANCE_MANAGEMENT', '勤怠管理', 'attendance', 'manage'),
('ATTENDANCE_UPDATE', '勤怠更新', 'attendance', 'update');

-- 基本ロールの挿入
INSERT INTO roles (name, description, is_system_role) VALUES
('SYSTEM_ADMIN', 'システム管理者', true),
('FACILITY_ADMIN', '施設管理者', true),
('FACILITY_STAFF', '施設職員', true);

-- ロール権限の関連付け
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'SYSTEM_ADMIN' AND p.name IN (
  'SYSTEM_SETTINGS', 'TENANT_MANAGEMENT', 'USER_MANAGEMENT',
  'ROLE_MANAGEMENT', 'SYSTEM_REPORTS', 'AUDIT_LOG_VIEW',
  'BACKUP_RESTORE', 'SYSTEM_MONITORING'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'FACILITY_ADMIN' AND p.name IN (
  'FACILITY_SETTINGS', 'USER_MANAGEMENT', 'SHIFT_MANAGEMENT',
  'ROLE_MANAGEMENT', 'ATTENDANCE_MANAGEMENT', 'REPORT_GENERATION',
  'DATA_EXPORT', 'FACILITY_REPORTS', 'NOTIFICATION_MANAGEMENT'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'FACILITY_STAFF' AND p.name IN (
  'SHIFT_VIEW', 'ATTENDANCE_UPDATE', 'HOLIDAY_REQUEST',
  'PROFILE_UPDATE', 'NOTIFICATION_VIEW', 'SHIFT_EXCHANGE_REQUEST',
  'WORK_SCHEDULE_VIEW'
);
```

## 🔍 5. 権限チェックの実装

### 5.1 権限チェック関数

```typescript
export const checkUserPermissions = async (
  userId: string,
  requiredPermissions: Permission[]
): Promise<boolean> => {
  try {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
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

### 5.2 キャッシュ戦略

```typescript
class PermissionCache {
  private cache = new Map<
    string,
    { permissions: Set<string>; expiresAt: number }
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
}
```

## 🧪 6. テスト計画

### 6.1 権限チェックのテスト

```typescript
describe('権限チェック', () => {
  it('システムアドミンは全権限を持つ', async () => {
    const hasPermission = await checkUserPermissions('system-admin-user-id', [
      'SYSTEM_SETTINGS',
      'TENANT_MANAGEMENT',
    ]);

    expect(hasPermission).toBe(true);
  });

  it('施設管理者は施設関連の権限を持つ', async () => {
    const hasFacilitySettings = await checkUserPermissions(
      'facility-admin-user-id',
      ['FACILITY_SETTINGS']
    );

    const hasSystemSettings = await checkUserPermissions(
      'facility-admin-user-id',
      ['SYSTEM_SETTINGS']
    );

    expect(hasFacilitySettings).toBe(true);
    expect(hasSystemSettings).toBe(false);
  });

  it('施設職員は制限された権限のみ持つ', async () => {
    const hasUserManagement = await checkUserPermissions(
      'facility-staff-user-id',
      ['USER_MANAGEMENT']
    );

    const hasShiftView = await checkUserPermissions('facility-staff-user-id', [
      'SHIFT_VIEW',
    ]);

    expect(hasUserManagement).toBe(false);
    expect(hasShiftView).toBe(true);
  });
});
```

## 📊 7. 実装順序

### Phase 1: 基本権限システム（2-3日）

1. 権限テーブルの作成
2. 基本ロール・権限の設定
3. 権限チェック関数の実装

### Phase 2: 認証ミドルウェア（1-2日）

1. tRPC認証ミドルウェアの実装
2. ページレベル権限チェックの実装
3. UI要素レベル権限チェックの実装

### Phase 3: 権限管理機能（1-2日）

1. ロール変更機能の実装
2. 一時権限システムの実装
3. 権限管理UIの実装

---

**次のステップ**: [セキュリティ要件詳細化](./security-requirements.md) の作成
