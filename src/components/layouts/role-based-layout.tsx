'use client';

import {
  SidebarLayout,
  UnifiedSidebar,
} from '@/components/navigation/unified-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useNavigation } from '@/hooks/use-navigation';
import { PropsWithChildren, useState } from 'react';

interface RoleBasedLayoutProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function RoleBasedLayout({
  title,
  description,
  children,
}: RoleBasedLayoutProps) {
  const { isAuthenticated, loading } = useNavigation();
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('sidebar:state='))
        ?.split('=')[1];

      if (cookieValue !== undefined) {
        return cookieValue === 'true';
      }
    }
    return true;
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // ローディング中
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto'></div>
          <p className='mt-2 text-sm text-gray-600'>読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証されていない場合
  if (!isAuthenticated) {
    return (
      <div
        className='flex items-center justify-center min-h-screen'
        data-testid='access-denied'
      >
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            アクセス権限がありません
          </h1>
          <p className='text-gray-600'>ログインが必要です。</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider open={isOpen} onOpenChange={handleOpenChange}>
      <UnifiedSidebar title={title} description={description} />
      <SidebarLayout title={title} description={description}>
        {children}
      </SidebarLayout>
    </SidebarProvider>
  );
}
