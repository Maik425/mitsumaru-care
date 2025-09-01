'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, HelpCircle, Building2, LogOut, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { ClockWidget } from './clock-widget';

export function UserDashboard() {
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // ユーザー情報の確認
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    const lastActivity = localStorage.getItem('lastActivity');

    if (!role || !email) {
      router.push('/');
      return;
    }

    // セッションタイムアウトチェック（30分）
    if (lastActivity) {
      const now = Date.now();
      const lastActivityTime = parseInt(lastActivity);
      const timeout = 30 * 60 * 1000; // 30分

      if (now - lastActivityTime > timeout) {
        // セッションタイムアウト
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('lastActivity');
        router.push('/?timeout=true');
        return;
      }
    }

    // 一般職員権限の確認
    if (role !== 'MEMBER') {
      // 権限不足の場合はエラーページにリダイレクト
      router.push('/?error=insufficient_permissions');
      return;
    }

    // アクティビティ時刻を更新
    localStorage.setItem('lastActivity', Date.now().toString());
    setUserRole(role);
    setUserEmail(email);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('lastActivity');
    router.push('/');
  };

  if (!userRole || !userEmail) {
    return <div>読み込み中...</div>;
  }

  const menuItems = [
    { name: '勤怠管理', href: '/user/attendance', icon: Clock },
    { name: '希望休管理', href: '/user/holidays', icon: Calendar },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Building2 className="h-6 w-6" />
            <div className="flex flex-col">
              <span className="font-semibold">みつまるケア</span>
              <span className="text-xs text-muted-foreground">一般職画面</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>メニュー</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild>
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>その他</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/faq">
                      <HelpCircle className="h-4 w-4" />
                      <span>FAQ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <LogOut className="h-4 w-4" />
                      <span>ログアウト</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold text-gray-900">
            ダッシュボード
          </h1>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              一般職ダッシュボード
            </h2>
            <p className="text-gray-600">
              お疲れ様です！今日も一日頑張りましょう
            </p>
          </div>

          <div className="mb-6">
            <ClockWidget />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="勤怠管理-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  勤怠管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  打刻申請・追加訂正申請ができます
                </p>
                <Link href="/user/attendance">
                  <Button className="w-full">勤怠ページへ</Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="希望休管理-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  希望休管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  希望休の入力・確認ができます
                </p>
                <Link href="/user/holidays">
                  <Button className="w-full">希望休入力ページへ</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6" data-testid="今月のシフト-card">
            <CardHeader>
              <CardTitle>今月のシフト</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                今月のシフト予定を確認できます（実装予定）
              </p>
            </CardContent>
          </Card>

          {/* 看護師専用機能 */}
          {userEmail === 'nurse@mitsumaru-care.com' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card data-testid="看護記録・管理-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    看護記録
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    看護記録の入力・管理ができます
                  </p>
                  <Link href="/user/nursing-records">
                    <Button className="w-full">看護記録・管理</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card data-testid="医療処置・管理-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    医療処置
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    医療処置の記録・管理ができます
                  </p>
                  <Link href="/user/medical-procedures">
                    <Button className="w-full">医療処置・管理</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
