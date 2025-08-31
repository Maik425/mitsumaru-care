import { initTRPC } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

// 認証ミドルウェア
const isAuthed = t.middleware(({ ctx, next }) => {
  // ここで認証チェックを実装
  // 現在は基本的な構造のみ
  return next({
    ctx: {
      ...ctx,
      // 認証済みユーザー情報を追加
    },
  });
});

export const authedProc = t.procedure.use(isAuthed);
export { t };
