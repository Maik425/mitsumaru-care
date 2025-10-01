'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useMemo, useState } from 'react';

import { useAuthContext } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { trpc } from '@/lib/trpc';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { accessToken } = useAuthContext();
  const [clientStateToken, setClientStateToken] = useState<string | null>(null);

  const token = accessToken ?? clientStateToken;

  const trpcClient = useMemo(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          async headers() {
            if (!token) {
              const {
                data: { session },
              } = await supabase.auth.getSession();
              setClientStateToken(session?.access_token ?? null);
              return {
                authorization: session?.access_token
                  ? `Bearer ${session.access_token}`
                  : '',
              };
            }

            return {
              authorization: `Bearer ${token}`,
            };
          },
        }),
      ],
    });
  }, [token]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
