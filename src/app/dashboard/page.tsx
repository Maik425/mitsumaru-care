'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import { Layout } from '@/src/components/layout/layout';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // 権限に応じて適切なダッシュボードにリダイレクト
      if (user.permissions.includes('SYSTEM_SETTINGS')) {
        router.push('/admin/dashboard');
      } else if (user.permissions.includes('SHIFT_MANAGEMENT')) {
        router.push('/facility-admin/dashboard');
      } else {
        router.push('/staff/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">ダッシュボードを読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              アクセス拒否
            </h2>
            <p className="text-gray-600">ログインが必要です</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">リダイレクト中...</p>
        </div>
      </div>
    </Layout>
  );
}
