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
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { useNavigation } from '@/hooks/use-navigation';
import { Building2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useState } from 'react';

interface UnifiedSidebarProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function UnifiedSidebar({
  title,
  description,
  children,
}: UnifiedSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { getConfig, isAuthenticated } = useNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 認証されていない場合は何も表示しない
  if (!isAuthenticated) {
    return null;
  }

  const config = getConfig();
  if (!config) {
    return null;
  }

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
    <TooltipProvider>
      <Sidebar data-testid='sidebar' collapsible='icon'>
        <SidebarHeader>
          <div className='flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:justify-center'>
            <Building2 className='h-6 w-6' />
            <div className='flex flex-col group-data-[collapsible=icon]:hidden'>
              <span className='font-semibold'>{config.title}</span>
              <span className='text-xs text-muted-foreground'>
                {config.subtitle}
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* メインセクション */}
          {config.sections.map(section => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel className='group-data-[collapsible=icon]:hidden'>
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname.startsWith(item.href)}
                              className={
                                pathname.startsWith(item.href) ? 'active' : ''
                              }
                            >
                              <Link href={item.href}>
                                <Icon className='h-4 w-4' />
                                <span className='group-data-[collapsible=icon]:hidden'>
                                  {item.name}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side='right'>
                            <p>{item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}

          {/* 共通アイテム */}
          {config.commonItems.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>その他</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {config.commonItems.map(item => {
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
                      <span className='group-data-[collapsible=icon]:hidden'>
                        {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}

export function SidebarLayout({
  children,
  title,
  description,
}: PropsWithChildren & { title: string; description?: string }) {
  return (
    <SidebarInset>
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' data-testid='sidebar-trigger' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm font-medium text-foreground'>{title}</span>
          {description ? (
            <span className='text-xs text-muted-foreground'>{description}</span>
          ) : null}
        </div>
      </header>
      <main className='flex-1 p-6'>{children}</main>
    </SidebarInset>
  );
}
