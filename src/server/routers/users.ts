import type {
  CreateUserDto,
  DeleteUserDto,
  GetUserDto,
  GetUsersDto,
  ResetPasswordDto,
  UpdateUserDto,
} from '@/lib/dto/user.dto';
import { UserRepository } from '@/lib/repositories/user.repository';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router, systemAdminProcedure } from '../trpc';

const userRepository = new UserRepository();

export const usersRouter = router({
  // ユーザー一覧取得（システム管理者専用）
  getUsers: systemAdminProcedure
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
        const dto: GetUsersDto = {
          limit: input.limit,
          offset: input.offset,
          role: input.role,
          facility_id: input.facility_id,
        };

        const result = await userRepository.getUsers(dto);
        return result;
      } catch (error) {
        console.error('Get users error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'ユーザー一覧の取得中にエラーが発生しました',
        });
      }
    }),

  // ユーザー詳細取得（システム管理者専用）
  getUser: systemAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const dto: GetUserDto = { id: input.id };
        const result = await userRepository.getUser(dto);
        return result;
      } catch (error) {
        console.error('Get user error:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'ユーザー情報の取得中にエラーが発生しました',
        });
      }
    }),

  // ユーザー作成（システム管理者専用）
  createUser: systemAdminProcedure
    .input(
      z.object({
        email: z.string().email('有効なメールアドレスを入力してください'),
        password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
        name: z.string().min(1, '名前を入力してください'),
        role: z.enum(['system_admin', 'facility_admin', 'user']),
        facility_id: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const dto: CreateUserDto = {
          email: input.email,
          password: input.password,
          name: input.name,
          role: input.role,
          facility_id: input.facility_id,
        };

        const result = await userRepository.createUser(dto);
        return result;
      } catch (error) {
        console.error('Create user error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'ユーザー作成中にエラーが発生しました',
        });
      }
    }),

  // ユーザー更新（システム管理者専用）
  updateUser: systemAdminProcedure
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
        const dto: UpdateUserDto = {
          id: input.id,
          name: input.name,
          role: input.role,
          facility_id: input.facility_id,
          is_active: input.is_active,
        };

        const result = await userRepository.updateUser(dto);
        return result;
      } catch (error) {
        console.error('Update user error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'ユーザー更新中にエラーが発生しました',
        });
      }
    }),

  // ユーザー削除（システム管理者専用）
  deleteUser: systemAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const dto: DeleteUserDto = { id: input.id };
        await userRepository.deleteUser(dto);
        return { success: true };
      } catch (error) {
        console.error('Delete user error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'ユーザー削除中にエラーが発生しました',
        });
      }
    }),

  // パスワードリセット
  resetPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const dto: ResetPasswordDto = { email: input.email };
        await userRepository.resetPassword(dto);
        return { success: true };
      } catch (error) {
        console.error('Reset password error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'パスワードリセット処理中にエラーが発生しました',
        });
      }
    }),

  // 施設一覧取得（システム管理者専用）
  getFacilities: systemAdminProcedure.query(async ({ ctx }) => {
    try {
      const { data: facilities, error } = await ctx.supabase
        .from('facilities')
        .select('id, name, address, created_at')
        .order('name');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '施設一覧の取得中にエラーが発生しました',
        });
      }

      return { facilities: facilities || [] };
    } catch (error) {
      console.error('Get facilities error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : '施設一覧の取得中にエラーが発生しました',
      });
    }
  }),

  // 施設別ユーザー統計取得（システム管理者専用）
  getUserStatsByFacility: systemAdminProcedure
    .input(z.object({ facility_id: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        let query = ctx.supabase
          .from('users')
          .select('role, facility_id, is_active');

        if (input.facility_id) {
          query = query.eq('facility_id', input.facility_id);
        }

        const { data: users, error } = await query;

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'ユーザー統計の取得中にエラーが発生しました',
          });
        }

        // ロール別・施設別の統計を計算
        const stats = {
          total: users?.length || 0,
          active: users?.filter(u => u.is_active).length || 0,
          inactive: users?.filter(u => !u.is_active).length || 0,
          byRole: {
            system_admin:
              users?.filter(u => u.role === 'system_admin').length || 0,
            facility_admin:
              users?.filter(u => u.role === 'facility_admin').length || 0,
            user: users?.filter(u => u.role === 'user').length || 0,
          },
        };

        return stats;
      } catch (error) {
        console.error('Get user stats error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'ユーザー統計の取得中にエラーが発生しました',
        });
      }
    }),
});
