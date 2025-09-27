'use client';

import { useAuthContext } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'system_admin' | 'facility_admin' | 'user';
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo = '/',
}: AuthGuardProps) {
  const { user, loading, requireAuth } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (requiredRole && !requireAuth(requiredRole)) {
      // 権限不足の場合は適切なダッシュボードにリダイレクト
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
          router.push('/');
      }
      return;
    }
  }, [user, loading, requiredRole, router, requireAuth]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && !requireAuth(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
