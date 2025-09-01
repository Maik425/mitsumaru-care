'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShiftCreateForm } from '@/components/shift-create-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShiftManagementPage() {
  const router = useRouter();
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    if (!role || !email) {
      router.push('/');
      return;
    }
    if (role !== 'ADMIN' && role !== 'OWNER') {
      router.push('/?error=insufficient_permissions');
      return;
    }
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {isOffline && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          ネットワークエラー: 接続できません
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>シフト作成</CardTitle>
        </CardHeader>
        <CardContent>
          <ShiftCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
