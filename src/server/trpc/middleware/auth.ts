import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from '../context';
import { createServerSupabaseClient } from '../../../lib/supabase';

const t = initTRPC.context<Context>().create();

// 基本的なミドルウェア
export const router = t.router;
export const publicProcedure = t.procedure;

// 共通の認証処理
async function authenticateUser(ctx: Context) {
  const supabase = createServerSupabaseClient();

  // Authorizationヘッダーからトークンを取得
  const authHeader = ctx.req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '認証が必要です。',
    });
  }

  const token = authHeader.substring(7);

  // トークンを検証
  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !supabaseUser) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '無効なトークンです。',
    });
  }

  // データベースからユーザー情報を取得
  const user = await ctx.prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: {
      userRoleAssignments: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'ユーザーが見つかりません。',
    });
  }

  // 権限をフラット化
  const permissions = [
    ...user.userRoleAssignments.flatMap(ura =>
      ura.role.rolePermissions.map(rp => rp.permission.name)
    ),
    ...user.userPermissions.map(up => up.permission.name),
  ];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    employeeNumber: user.employeeNumber,
    permissions: [...new Set(permissions)], // 重複を除去
  };
}

// 認証が必要なプロシージャ
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    try {
      const user = await authenticateUser(ctx);

      return next({
        ctx: {
          ...ctx,
          user,
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '認証処理中にエラーが発生しました。',
      });
    }
  })
);

// 管理者権限が必要なプロシージャ
export const adminProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    try {
      const user = await authenticateUser(ctx);

      // 管理者権限チェック
      const hasAdminPermission =
        user.permissions.includes('SYSTEM_SETTINGS') ||
        user.permissions.includes('USER_MANAGEMENT') ||
        user.permissions.includes('ROLE_MANAGEMENT');

      if (!hasAdminPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '管理者権限が必要です。',
        });
      }

      return next({
        ctx: {
          ...ctx,
          user,
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '認証処理中にエラーが発生しました。',
      });
    }
  })
);

// 特定の権限が必要なプロシージャを作成するヘルパー関数
export function createPermissionProcedure(requiredPermission: string) {
  return t.procedure.use(
    t.middleware(async ({ ctx, next }) => {
      try {
        const user = await authenticateUser(ctx);

        if (!user.permissions.includes(requiredPermission)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `${requiredPermission}権限が必要です。`,
          });
        }

        return next({
          ctx: {
            ...ctx,
            user,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '認証処理中にエラーが発生しました。',
        });
      }
    })
  );
}
