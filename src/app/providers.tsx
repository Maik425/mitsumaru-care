'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/src/server/trpc/routers';
import { AuthProvider } from '@/src/contexts/auth-context';

export const trpc = createTRPCReact<AppRouter>();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          // 認証ヘッダーを追加
          headers: () => {
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('auth-token');
              const userRole = localStorage.getItem('userRole');

              // テスト用のトークン設定
              let authToken = token;
              if (!authToken && userRole) {
                authToken =
                  userRole === 'ADMIN' ? 'admin-token' : 'member-token';
              }

              return authToken ? { authorization: `Bearer ${authToken}` } : {};
            }
            return {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
