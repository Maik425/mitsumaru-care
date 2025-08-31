'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/src/hooks/use-auth';
import { usePermission } from '@/src/hooks/use-permission';
import { LoginForm } from '@/components/login-form';

interface AuthGuardProps {
  children: ReactNode;
  requiredPermissions?: string[];
  fallback?: ReactNode;
  showLoginOnUnauthorized?: boolean;
}

export function AuthGuard({
  children,
  requiredPermissions = [],
  fallback,
  showLoginOnUnauthorized = true,
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const hasPermission = usePermission(requiredPermissions);

  // ローディング中
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  // 未認証
  if (!user) {
    if (showLoginOnUnauthorized) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                みつまるケア
              </h1>
              <p className="text-gray-600">職員専用ポータル</p>
            </div>
            <LoginForm />
          </div>
        </div>
      );
    }
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              アクセス拒否
            </h2>
            <p className="text-gray-600">ログインが必要です</p>
          </div>
        </div>
      )
    );
  }

  // 権限不足
  if (requiredPermissions.length > 0 && !hasPermission) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              権限不足
            </h2>
            <p className="text-gray-600">
              このページにアクセスする権限がありません
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>メール: {user.email}</p>
              <p>権限: {user.permissions.join(', ')}</p>
            </div>
          </div>
        </div>
      )
    );
  }

  // 認証・権限OK
  return <>{children}</>;
}

// 便利なラッパーコンポーネント
export function AdminGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requiredPermissions={['SYSTEM_SETTINGS']} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function FacilityAdminGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requiredPermissions={['SHIFT_MANAGEMENT']} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function StaffGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requiredPermissions={['SHIFT_VIEW']} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

// ログイン状態のみチェック（権限チェックなし）
export function AuthenticatedGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <AuthGuard requiredPermissions={[]} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}
