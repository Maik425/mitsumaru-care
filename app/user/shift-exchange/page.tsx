'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShiftExchangePage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    if (!role || !email) {
      router.push('/');
      return;
    }
    if (role !== 'MEMBER') {
      router.push('/?error=insufficient_permissions');
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/user/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 ml-4">
              シフト申請
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">シフト交換</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>交換したいシフトを選択してください</p>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant="outline"
                    size="sm"
                    className="h-12"
                  >
                    {i + 1 === 15 ? '2025-03-15' : `${i + 1}日`}
                  </Button>
                ))}
              </div>
              <div>
                <label
                  htmlFor="exchange-target"
                  className="block text-sm font-medium text-gray-700"
                >
                  交換相手
                </label>
                <select
                  id="exchange-target"
                  aria-label="交換相手"
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="tanaka">田中 次郎</option>
                  <option value="suzuki">鈴木 花子</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  交換理由
                </label>
                <textarea
                  id="reason"
                  aria-label="交換理由"
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
              <Button
                onClick={() => {
                  const message = document.createElement('div');
                  message.textContent = 'シフト交換申請が送信されました';
                  message.style.cssText =
                    'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
                  document.body.appendChild(message);
                  setTimeout(() => document.body.removeChild(message), 3000);
                }}
              >
                申請
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
