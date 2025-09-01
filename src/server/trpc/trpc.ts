import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

// 認証ミドルウェア
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '認証が必要です',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// 管理者権限ミドルウェア
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '認証が必要です',
    });
  }

  if (!ctx.user.permissions.includes('ADMIN')) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '管理者権限が必要です',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// 公開プロシージャ（認証不要）
export const publicProcedure = t.procedure;

// 認証済みプロシージャ（認証必要）
export const protectedProcedure = t.procedure.use(isAuthed);

// 管理者プロシージャ（管理者権限必要）
export const adminProcedure = t.procedure.use(isAdmin);

export { t };
