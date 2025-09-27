import { supabaseAdmin } from '@/lib/supabase';
import type { RegisterData, User } from '@/lib/types/auth';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const usersRouter = router({
  // ユーザー一覧取得
  getUsers: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        role: z.enum(['system_admin', 'facility_admin', 'user']).optional(),
        facility_id: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = supabaseAdmin
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);

        if (input.role) {
          query = query.eq('role', input.role);
        }

        if (input.facility_id) {
          query = query.eq('facility_id', input.facility_id);
        }

        const { data, error } = await query;

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'ユーザー一覧の取得に失敗しました',
          });
        }

        return data as User[];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ユーザー一覧の取得中にエラーが発生しました',
        });
      }
    }),

  // ユーザー詳細取得
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', input.id)
          .single();

        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ユーザーが見つかりません',
          });
        }

        return data as User;
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

  // ユーザー作成
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email('有効なメールアドレスを入力してください'),
        password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
        name: z.string().min(1, '名前を入力してください'),
        role: z.enum(['system_admin', 'facility_admin', 'user']),
        facility_id: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: RegisterData }) => {
      try {
        // Supabaseでユーザー作成
        const { data: authData, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email: input.email,
            password: input.password,
            email_confirm: true,
          });

        if (authError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ユーザー作成に失敗しました: ' + authError.message,
          });
        }

        if (!authData.user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'ユーザー作成に失敗しました',
          });
        }

        // ユーザー情報をデータベースに保存
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user.id,
            name: input.name,
            role: input.role,
            facility_id: input.facility_id,
            is_active: true,
          } as any)
          .select()
          .single();

        if (userError) {
          // 作成したユーザーを削除
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'ユーザー情報の保存に失敗しました',
          });
        }

        return userData as User;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ユーザー作成中にエラーが発生しました',
        });
      }
    }),

  // ユーザー更新
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, '名前を入力してください').optional(),
        role: z.enum(['system_admin', 'facility_admin', 'user']).optional(),
        facility_id: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const updateData: Partial<User> = {};

        if (input.name !== undefined) updateData.name = input.name;
        if (input.role !== undefined) updateData.role = input.role;
        if (input.facility_id !== undefined)
          updateData.facility_id = input.facility_id;
        if (input.is_active !== undefined)
          updateData.is_active = input.is_active;

        const { data, error } = await (supabaseAdmin as any)
          .from('users')
          .update(updateData)
          .eq('id', input.id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'ユーザー情報の更新に失敗しました',
          });
        }

        return data as User;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ユーザー更新中にエラーが発生しました',
        });
      }
    }),

  // ユーザー削除
  deleteUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // データベースからユーザー情報を削除
        const { error: userError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', input.id);

        if (userError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'ユーザー情報の削除に失敗しました',
          });
        }

        // Supabaseからユーザーを削除
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
          input.id
        );

        if (authError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'ユーザーアカウントの削除に失敗しました',
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ユーザー削除中にエラーが発生しました',
        });
      }
    }),

  // パスワードリセット
  resetPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
          input.email,
          {
            redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/reset-password`,
          }
        );

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'パスワードリセットメールの送信に失敗しました',
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'パスワードリセット処理中にエラーが発生しました',
        });
      }
    }),
});
