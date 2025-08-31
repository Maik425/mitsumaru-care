import { t, authedProc } from '../trpc';
import { yupInput } from '@/src/shared/yupInput';
import {
  CreateProject,
  CreateProjectSchema,
} from '@/src/application/usecases/project/CreateProject';
import { PrismaProjectRepository } from '@/src/infra/repositories/PrismaProjectRepository';

export const projectRouter = t.router({
  list: authedProc.query(({ ctx }) => {
    const repo = new PrismaProjectRepository();
    return repo.findAllByTenant(ctx.tenantId!);
  }),

  create: authedProc
    .input(yupInput(CreateProjectSchema))
    .mutation(async ({ ctx, input }) => {
      const uc = new CreateProject(new PrismaProjectRepository());
      return uc.execute(input, {
        userId: ctx.user!.id,
        tenantId: ctx.tenantId!,
        role: ctx.role!,
      });
    }),
});
