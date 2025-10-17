import { router } from '../trpc';
import { attendanceRouter } from './attendance';
import { authRouter } from './auth';
import { holidayRouter } from './holiday';
import { jobRulesRouter } from './job-rules';
import { positionsRouter } from './positions';
import { skillsRouter } from './skills';
import { usersRouter } from './users';

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  attendance: attendanceRouter,
  holidays: holidayRouter,
  skills: skillsRouter,
  positions: positionsRouter,
  jobRules: jobRulesRouter,
});

export type AppRouter = typeof appRouter;
