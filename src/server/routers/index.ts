import { router } from '../trpc';
import { attendanceRouter } from './attendance';
import { authRouter } from './auth';
import { usersRouter } from './users';

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  attendance: attendanceRouter,
});

export type AppRouter = typeof appRouter;
