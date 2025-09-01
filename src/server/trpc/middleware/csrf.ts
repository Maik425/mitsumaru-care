import { TRPCError } from '@trpc/server';
import { t } from '../trpc';
import { verifyCSRFToken } from '@/src/lib/csrf';

export const csrfProtection = t.middleware(async ({ ctx, next }) => {
  // CSRFトークンの検証
  const csrfToken = ctx.req?.headers?.get('x-csrf-token') || '';
  const sessionToken = ctx.req?.headers?.get('x-session-token') || '';

  if (!csrfToken || !sessionToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'CSRFトークンまたはセッショントークンが不足しています',
    });
  }

  // セッショントークンを秘密鍵として使用してCSRFトークンを検証
  const isValid = verifyCSRFToken(csrfToken, sessionToken, csrfToken);

  if (!isValid) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'CSRFトークンが無効です',
    });
  }

  return next({
    ctx: {
      ...ctx,
      csrfVerified: true,
    },
  });
});

export const csrfProcedure = csrfProtection;
