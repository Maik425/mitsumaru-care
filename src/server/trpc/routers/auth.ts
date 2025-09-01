import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router } from '../middleware/auth';
import {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '../middleware/auth';
import { logLoginSuccess, logLoginFailure } from '../../../lib/security-logger';
import { rateLimitHelpers } from '../../../lib/rate-limit';
import { createServerSupabaseClient } from '../../../lib/supabase';

// ログイン入力のバリデーション
const loginInputSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

export const authRouter = router({
  // ログイン処理
  login: publicProcedure
    .input(loginInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const clientIp =
        ctx.req.headers.get('x-forwarded-for') ||
        ctx.req.headers.get('x-real-ip') ||
        'unknown';
      const userAgent = ctx.req.headers.get('user-agent') || 'unknown';

      try {
        // レート制限チェック
        const rateLimitResult = rateLimitHelpers.checkLoginRateLimit(clientIp);
        if (!rateLimitResult.allowed) {
          logLoginFailure(
            email,
            clientIp,
            userAgent,
            'レート制限によりブロック'
          );
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message:
              'ログイン試行回数が上限に達しました。しばらく時間をおいてから再試行してください。',
          });
        }

        // Supabaseで認証
        const supabase = createServerSupabaseClient();
        const {
          data: { user, session },
          error,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !user || !session) {
          logLoginFailure(
            email,
            clientIp,
            userAgent,
            error?.message || '認証失敗'
          );
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'メールアドレスまたはパスワードが正しくありません',
          });
        }

        // ユーザー情報と権限を取得
        const userWithPermissions = await ctx.prisma.user.findUnique({
          where: { id: user.id },
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
          },
        });

        if (!userWithPermissions) {
          logLoginFailure(
            email,
            clientIp,
            userAgent,
            'ユーザー情報が見つかりません'
          );
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ユーザー情報が見つかりません',
          });
        }

        // 権限を抽出
        const permissions = userWithPermissions.userRoleAssignments
          .flatMap(ura => ura.role.rolePermissions)
          .map(rp => rp.permission.name);

        // セキュリティログに記録
        logLoginSuccess(user.id, email, clientIp, userAgent);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email!,
            name: userWithPermissions.name,
            employeeNumber: userWithPermissions.employeeNumber,
            permissions,
          },
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logLoginFailure(email, clientIp, userAgent, '予期しないエラー');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ログイン処理中にエラーが発生しました',
        });
      }
    }),

  // ログアウト処理
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.supabase.auth.signOut();
      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ログアウト処理中にエラーが発生しました',
      });
    }
  }),

  // 現在のユーザー情報取得
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userWithPermissions = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
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
        },
      });

      if (!userWithPermissions) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザー情報が見つかりません',
        });
      }

      const permissions = userWithPermissions.userRoleAssignments
        .flatMap(ura => ura.role.rolePermissions)
        .map(rp => rp.permission.name);

      return {
        id: userWithPermissions.id,
        email: userWithPermissions.email,
        name: userWithPermissions.name,
        employeeNumber: userWithPermissions.employeeNumber,
        permissions,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー情報の取得中にエラーが発生しました',
      });
    }
  }),

  // ユーザー一覧取得（管理者のみ）
  getUsers: adminProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          employeeNumber: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return users;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー一覧の取得中にエラーが発生しました',
      });
    }
  }),

  // 権限一覧取得（管理者のみ）
  getPermissions: adminProcedure.query(async ({ ctx }) => {
    try {
      const permissions = await ctx.prisma.permission.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
        },
        orderBy: { name: 'asc' },
      });

      return permissions;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '権限一覧の取得中にエラーが発生しました',
      });
    }
  }),

  // ロール一覧取得（管理者のみ）
  getRoles: adminProcedure.query(async ({ ctx }) => {
    try {
      const roles = await ctx.prisma.role.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          rolePermissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return roles;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ロール一覧の取得中にエラーが発生しました',
      });
    }
  }),
});
