'use client';

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

export function AdminDashboard() {
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
                  <SidebarMenuButton asChild>
                    <Link href='/'>
                      <LogOut className='h-4 w-4' />
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
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <h1 className='text-xl font-semibold text-gray-900'>
            ダッシュボード
          </h1>
          <div className='ml-auto'>
            <Link href='/'>
              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-2 bg-transparent'
              >
                <LogOut className='h-4 w-4' />
                ログアウト
              </Button>
            </Link>
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
