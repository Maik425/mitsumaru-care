'use client';

import { FullScreenLoadingSpinner } from '@/components/ui/loading-spinner';
import type { AuthGuardProps } from '@/lib/auth/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './auth-provider';

export function AuthGuard({
  children,
  requiredRole,
  fallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // 権限不足の場合は適切なページにリダイレクト
      switch (user.role) {
        case 'system_admin':
          router.push('/system/dashboard');
          break;
        case 'facility_admin':
          router.push('/facility/dashboard');
          break;
        case 'user':
          router.push('/user/dashboard');
          break;
        default:
          router.push('/login');
      }
      return;
    }
  }, [user, loading, initialized, requiredRole, router, redirectTo]);

  if (!initialized || loading) {
    return <FullScreenLoadingSpinner text='認証状態を確認中...' />;
  }

  if (!user) {
    return fallback || null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return fallback || null;
  }

  return <>{children}</>;
}

