import { initTRPC } from '@trpc/server';
import { Context } from '../context';

const t = initTRPC.context<Context>().create();

// 基本的なミドルウェア
export const router = t.router;
export const publicProcedure = t.procedure;

// 認証が必要なプロシージャ
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    // ここで認証チェックを実装
    // 現在は基本的な構造のみ
    return next({
      ctx: {
        ...ctx,
        // 認証済みユーザー情報を追加
      },
    });
  })
);

// 管理者権限が必要なプロシージャ
export const adminProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    // ここで管理者権限チェックを実装
    // 現在は基本的な構造のみ
    return next({
      ctx: {
        ...ctx,
        // 管理者権限情報を追加
      },
    });
  })
);
