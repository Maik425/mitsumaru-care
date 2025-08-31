import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/src/server/trpc/routers';
import { createContext } from '@/src/server/trpc/context';

export const runtime = 'nodejs';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      // App Router用のコンテキスト作成
      return createContext({
        req,
        res: {} as any,
      });
    },
  });

export { handler as GET, handler as POST };
