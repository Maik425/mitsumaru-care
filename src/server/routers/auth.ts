import { handleAuthError } from '@/lib/auth/errors';
import type { AuthUser, LoginCredentials } from '@/lib/auth/types';
import { supabaseAdmin } from '@/lib/supabase/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const authRouter = router({
  // ログイン
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email('有効なメールアドレスを入力してください'),
        password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
      })
    )
    .mutation(async ({ input }: { input: LoginCredentials }) => {
      try {
        // Supabaseで認証
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          throw handleAuthError(error);
        }

        if (!data.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '認証に失敗しました',
          });
        }

        // ユーザー情報を取得
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ユーザー情報が見つかりません',
          });
        }

        if (!userData.is_active) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'アカウントが無効化されています',
          });
        }

        const authUser: AuthUser = {
          id: userData.id,
          email: data.user.email!,
          name: userData.name,
          role: userData.role,
          facility_id: userData.facility_id,
        };

        return {
          user: authUser,
          session: data.session,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        const authError = handleAuthError(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: authError.message,
        });
      }
    }),

  // ログアウト
  logout: publicProcedure.mutation(async () => {
    try {
      const { error } = await supabaseAdmin.auth.signOut();
      if (error) {
        throw handleAuthError(error);
      }
      return { success: true };
    } catch (error) {
      const authError = handleAuthError(error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: authError.message,
      });
    }
  }),

  // 現在のユーザー情報を取得
  getCurrentUser: publicProcedure.query(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser();

      if (error || !user) {
        return null;
      }

      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return null;
      }

      const authUser: AuthUser = {
        id: userData.id,
        email: user.email!,
        name: userData.name,
        role: userData.role,
        facility_id: userData.facility_id,
      };

      return authUser;
    } catch (error) {
      return null;
    }
  }),

  // セッション確認
  getSession: publicProcedure.query(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabaseAdmin.auth.getSession();

      if (error || !session) {
        return null;
      }

      return session;
    } catch (error) {
      return null;
    }
  }),
});
