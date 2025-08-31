import { t } from '../trpc';
import { projectRouter } from './project';

export const appRouter = t.router({
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
