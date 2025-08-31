import { initTRPC, TRPCError } from '@trpc/server';

type Ctx = {
  user?: { id: string };
  tenantId?: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER';
};

const t = initTRPC.context<Ctx>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.tenantId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next();
});

export const authedProc = t.procedure.use(isAuthed);
export { t };
