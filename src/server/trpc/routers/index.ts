import { router, publicProcedure } from '../middleware/auth';
import { authRouter } from './auth';
import { shiftTypesRouter } from './shift-types';
import { positionsRouter } from './positions';
import { skillsRouter } from './skills';
import { jobRulesRouter } from './job-rules';
import { shiftsRouter } from './shifts';
import { roleAssignmentsRouter } from './role-assignments';
import { attendanceRouter } from './attendance';

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
  shiftTypes: shiftTypesRouter,
  positions: positionsRouter,
  skills: skillsRouter,
  jobRules: jobRulesRouter,
  shifts: shiftsRouter,
  roleAssignments: roleAssignmentsRouter,
  attendance: attendanceRouter,
});

export type AppRouter = typeof appRouter;
