import { router } from '../trpc';
import { attendanceRouter } from './attendance';
import { authRouter } from './auth';
import { holidayRouter } from './holiday';
import { usersRouter } from './users';

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  attendance: attendanceRouter,
  holidays: holidayRouter,
});

export type AppRouter = typeof appRouter;
