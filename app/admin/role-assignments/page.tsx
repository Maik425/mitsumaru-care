'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RoleManagementPage() {
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
              役割表管理
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">役割表作成</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="target-date">対象日</Label>
                <Input
                  id="target-date"
                  type="date"
                  defaultValue="2025-03-15"
                  aria-label="対象日"
                />
              </div>
              <div>
                <Label htmlFor="role-template">役割テンプレート</Label>
                <select
                  id="role-template"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  aria-label="役割テンプレート"
                >
                  <option value="basic">基本配置</option>
                  <option value="care-heavy">介護多め</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    const message = document.createElement('div');
                    message.textContent = '割り当てが完了しました';
                    message.style.cssText =
                      'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
                    document.body.appendChild(message);
                    setTimeout(() => document.body.removeChild(message), 3000);
                  }}
                >
                  自動割り当て
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const message = document.createElement('div');
                    message.textContent = '役割表が確定されました';
                    message.style.cssText =
                      'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
                    document.body.appendChild(message);
                    setTimeout(() => document.body.removeChild(message), 3000);
                  }}
                >
                  確定
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
