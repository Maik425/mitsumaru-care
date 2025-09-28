'use client';

import {
  Building2,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  HelpCircle,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { useAuthContext } from '@/contexts/auth-context';

export function FacilityDashboard() {
  const { signOut } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('ログアウトボタンがクリックされました');
      await signOut();
    } catch (error) {
      console.error('ログアウト処理でエラーが発生しました:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      title: 'シフト管理',
      items: [
        {
          name: 'シフト詳細設定',
          href: '/facility/shift/create',
          icon: Calendar,
        },
        {
          name: 'シフト簡単作成',
          href: '/facility/shift/edit',
          icon: FileText,
        },
        { name: '休み管理', href: '/facility/shift/holidays', icon: Calendar },
      ],
    },
    {
      title: '役割表管理',
      items: [{ name: '役割表管理', href: '/facility/roles', icon: Users }],
    },
    {
      title: '各種登録管理',
      items: [
        {
          name: 'シフト形態管理',
          href: '/facility/settings/attendance-types',
          icon: Clock,
        },
        { name: '役職登録', href: '/facility/settings/positions', icon: Users },
        { name: '技能登録', href: '/facility/settings/skills', icon: Settings },
        {
          name: '職種・配置ルール登録',
          href: '/facility/settings/job-rules',
          icon: Settings,
        },
        {
          name: '役割表登録',
          href: '/facility/settings/role-templates',
          icon: FileText,
        },
        {
          name: '勤怠管理登録',
          href: '/facility/settings/attendance-management',
          icon: ClipboardList,
        },
        {
          name: 'ログインアカウント登録',
          href: '/facility/settings/accounts',
          icon: Users,
        },
      ],
    },
    {
      title: '勤怠確認',
      items: [{ name: '勤怠確認', href: '/facility/attendance', icon: Clock }],
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className='flex items-center gap-2 px-4 py-2'>
            <Building2 className='h-6 w-6' />
            <div className='flex flex-col'>
              <span className='font-semibold'>みつまるケア</span>
              <span className='text-xs text-muted-foreground'>管理者画面</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {menuItems.map(section => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                          <Link href={item.href}>
                            <Icon className='h-4 w-4' />
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
                    <Link href='/faq'>
                      <HelpCircle className='h-4 w-4' />
                      <span>FAQ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    type='button'
                    disabled={isLoggingOut}
                  >
                    <LogOut className='h-4 w-4' />
                    <span>
                      {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <h1 className='text-xl font-semibold text-gray-900'>
            ダッシュボード
          </h1>
          <div className='ml-auto'>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-2 bg-transparent'
              onClick={handleLogout}
              type='button'
              disabled={isLoggingOut}
            >
              <LogOut className='h-4 w-4' />
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </Button>
          </div>
        </header>

        <main className='flex-1 p-6'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              管理者ダッシュボード
            </h2>
            <p className='text-gray-600'>介護業務の効率化をサポートします</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {menuItems.map(section => (
              <Card key={section.title} className='h-fit'>
                <CardHeader>
                  <CardTitle className='text-lg'>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant='ghost'
                          className='w-full justify-start'
                        >
                          <Icon className='h-4 w-4 mr-2' />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
