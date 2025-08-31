import { router, publicProcedure } from '../middleware/auth';
import { authRouter } from './auth';

// 基本的なヘルスチェックルーター
export const appRouter = router({
  health: router({
    check: publicProcedure.query(async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'mitsumaru-care API is running',
      };
    }),
  }),
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
