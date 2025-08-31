import React from 'react';
import { useAuth } from '../../hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions,
  fallback = <div>アクセス拒否</div>,
}) => {
  const { user, isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return null; // ローディング中は何も表示しない
  }

  if (!isAuthenticated || !user) {
    // 実際の実装では、useRouter を使用してリダイレクト
    return <div>ログインが必要です</div>;
  }

  if (!hasPermission(requiredPermissions)) {
    return fallback;
  }

  return <>{children}</>;
};
