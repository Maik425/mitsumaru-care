import { router } from '../trpc';

export const appRouter = router({
  // ここにルーターを追加していきます
});

export type AppRouter = typeof appRouter;
