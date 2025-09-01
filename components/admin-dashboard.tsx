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
import {
  Calendar,
  Users,
  Clock,
  Settings,
  FileText,
  HelpCircle,
  Building2,
  LogOut,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

export function AdminDashboard() {
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

    // 管理者権限の確認
    if (role !== 'ADMIN' && role !== 'OWNER') {
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

  const handleTestTimeout = () => {
    // テスト用：セッションタイムアウトをシミュレート
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('lastActivity');
    router.push('/?timeout=true');
  };

  if (!userRole || !userEmail) {
    return <div>読み込み中...</div>;
  }

  const menuItems = [
    {
      title: 'シフト管理',
      items: [
        { name: 'シフト詳細設定', href: '/admin/shift/create', icon: Calendar },
        { name: 'シフト簡単作成', href: '/admin/shift/edit', icon: FileText },
        { name: '休み管理', href: '/admin/shift/holidays', icon: Calendar },
      ],
    },
    {
      title: '役割表管理',
      items: [{ name: '役割表管理', href: '/admin/roles', icon: Users }],
    },
    {
      title: '各種登録管理',
      items: [
        {
          name: 'シフト形態管理',
          href: '/admin/settings/attendance-types',
          icon: Clock,
        },
        { name: '役職登録', href: '/admin/settings/positions', icon: Users },
        { name: '技能登録', href: '/admin/settings/skills', icon: Settings },
        {
          name: '職種・配置ルール登録',
          href: '/admin/settings/job-rules',
          icon: Settings,
        },
        {
          name: '役割表登録',
          href: '/admin/settings/role-templates',
          icon: FileText,
        },
        {
          name: '勤怠管理登録',
          href: '/admin/settings/attendance-management',
          icon: ClipboardList,
        },
        {
          name: 'ログインアカウント登録',
          href: '/admin/settings/accounts',
          icon: Users,
        },
      ],
    },
    {
      title: '勤怠確認',
      items: [{ name: '勤怠確認', href: '/admin/attendance', icon: Clock }],
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Building2 className="h-6 w-6" />
            <div className="flex flex-col">
              <span className="font-semibold">みつまるケア</span>
              <span className="text-xs text-muted-foreground">管理者画面</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {menuItems.map(section => (
            <SidebarGroup
              key={section.title}
              data-testid={`サイドバー-${section.title}`}
            >
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map(item => {
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
          ))}

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
                    <Link
                      href="/"
                      data-testid="sidebar-logout"
                      onClick={handleLogout}
                    >
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
          <div className="ml-auto">
            <Link href="/" data-testid="header-logout">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              管理者ダッシュボード
            </h2>
            <p className="text-gray-600">介護業務の効率化をサポートします</p>

            {/* ユーザー情報表示 */}
            <div
              className="mt-4 p-4 bg-gray-50 rounded-lg"
              data-testid="user-info-section"
            >
              <h3 className="text-lg font-semibold mb-2">ユーザー情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">名前:</span>
                  <span className="ml-2" data-testid="user-name">
                    {userEmail === 'admin@mitsumaru-care.com'
                      ? '管理者 太郎'
                      : userEmail === 'owner@mitsumaru-care.com'
                        ? '施設長 一郎'
                        : '管理者'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">役割:</span>
                  <span className="ml-2" data-testid="user-role">
                    {userRole === 'ADMIN'
                      ? 'ADMIN'
                      : userRole === 'OWNER'
                        ? 'OWNER'
                        : 'MEMBER'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(section => (
              <Card
                key={section.title}
                className="h-fit"
                data-testid={`${section.title.toLowerCase().replace(/\s+/g, '-')}-card`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {/* 職員管理カード */}
            <Card className="h-fit" data-testid="職員管理-card">
              <CardHeader>
                <CardTitle className="text-lg">職員管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/settings/accounts">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    職員登録・編集
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 勤怠管理カード */}
            <Card className="h-fit" data-testid="勤怠管理-card">
              <CardHeader>
                <CardTitle className="text-lg">勤怠管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/attendance">
                  <Button variant="ghost" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    勤怠確認・承認
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 役割表管理カード */}
            <Card className="h-fit" data-testid="役割表管理-メインカード">
              <CardHeader>
                <CardTitle className="text-lg">役割表管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/roles">
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    役割表作成・管理
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 施設長専用機能 */}
            {userRole === 'OWNER' && (
              <>
                <Card className="h-fit" data-testid="システム設定・管理-card">
                  <CardHeader>
                    <CardTitle className="text-lg">システム設定</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/admin/settings/system">
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        システム設定・管理
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="h-fit" data-testid="テナント管理・設定-card">
                  <CardHeader>
                    <CardTitle className="text-lg">テナント管理</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/admin/settings/tenant">
                      <Button variant="ghost" className="w-full justify-start">
                        <Building2 className="h-4 w-4 mr-2" />
                        テナント管理・設定
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
