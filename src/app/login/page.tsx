'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { LoginForm } from '@/components/auth/login-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 既にログインしている場合は適切なダッシュボードにリダイレクト
    if (!loading && user) {
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
          router.push('/user/dashboard');
      }
    }
  }, [user, loading, router]);

  // ローディング中または既にログインしている場合は何も表示しない
  if (loading || user) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto'></div>
          <p className='mt-2 text-sm text-gray-600'>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>ログイン</h1>
          <p className='text-gray-600'>
            発行済みのメールアドレスとパスワードでログインしてください
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
