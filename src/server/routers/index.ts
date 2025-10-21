import { router } from '../trpc';
import { attendanceRouter } from './attendance';
import { authRouter } from './auth';
import { exportRouter } from './export';
import { facilitiesRouter } from './facilities';
import { holidayRouter } from './holiday';
import { jobRulesRouter } from './job-rules';
import { notificationRouter } from './notification';
import { positionsRouter } from './positions';
import { skillsRouter } from './skills';
import { systemSettingsRouter } from './system-settings';
import { usersRouter } from './users';

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  facilities: facilitiesRouter,
  attendance: attendanceRouter,
  holidays: holidayRouter,
  skills: skillsRouter,
  positions: positionsRouter,
  jobRules: jobRulesRouter,
  systemSettings: systemSettingsRouter,
  export: exportRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
