'use client';

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
import { Building2, Calendar, Clock, HelpCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useState } from 'react';

interface UserShellProps extends PropsWithChildren {
  title: string;
  description?: string;
}

const primaryMenu = [
  { name: 'ダッシュボード', href: '/user/dashboard', icon: Building2 },
  { name: '勤怠管理', href: '/user/attendance', icon: Clock },
  { name: '希望休管理', href: '/user/holidays', icon: Calendar },
];

const secondaryMenu = [{ name: 'FAQ', href: '/faq', icon: HelpCircle }];

export function UserShell({ title, description, children }: UserShellProps) {
  const pathname = usePathname();
  const { signOut } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('ログアウト処理でエラーが発生しました:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className='flex items-center gap-2 px-4 py-2'>
            <Building2 className='h-6 w-6' />
            <div className='flex flex-col'>
              <span className='font-semibold'>みつまるケア</span>
              <span className='text-xs text-muted-foreground'>一般職画面</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>メニュー</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryMenu.map(item => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                      >
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

          <SidebarGroup>
            <SidebarGroupLabel>その他</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryMenu.map(item => {
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
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm font-medium text-foreground'>{title}</span>
            {description ? (
              <span className='text-xs text-muted-foreground'>
                {description}
              </span>
            ) : null}
          </div>
        </header>
        <main className='flex-1 p-6'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
