'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/src/app/providers';
import { showSuccessMessage, handleApiError } from '@/src/lib/api-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShiftExchangeApprovalPage() {
  const router = useRouter();

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

  const pendingExchanges = [
    {
      id: 1,
      requester: '田中 太郎',
      requestedDate: '2025-03-15',
      requestedShift: '日勤',
      targetDate: '2025-03-20',
      targetShift: '早番',
      status: '承認待ち',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 ml-4">
              シフト交換管理
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>シフト交換申請一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingExchanges.map(exchange => (
                <div key={exchange.id} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{exchange.requester}</h3>
                    <Badge variant="secondary">承認待ち</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {exchange.requestedDate} {exchange.requestedShift} →{' '}
                    {exchange.targetDate} {exchange.targetShift}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          // フェーズ1: ダミー処理（将来的にはAPI呼び出し）
                          // const approvalData = { exchangeId: exchange.id, status: 'approved' };
                          // await approveExchangeMutation.mutateAsync(approvalData);
                          await new Promise(resolve => setTimeout(resolve, 500));
                          
                          // 既存のメッセージ仕様を維持
                          showSuccessMessage('exchangeApproved');
                        } catch (error) {
                          handleApiError(error, 'シフト交換の承認中にエラーが発生しました');
                        }
                      }}
                    >
                      承認
                    </Button>
                    <Button size="sm" variant="outline">
                      却下
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
