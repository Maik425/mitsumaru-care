import type {
  CreatePositionDto,
  CreateUserPositionDto,
  GetPositionsDto,
  GetUserPositionsDto,
  UpdatePositionDto,
} from '@/lib/dto/positions.dto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  PositionsRepository,
  SupabasePositionsDataSource,
} from '@/lib/repositories';

import { protectedProcedure, publicProcedure, router } from '../trpc';

const createRepository = (client: SupabaseClient) =>
  new PositionsRepository(new SupabasePositionsDataSource(client));

export const positionsRouter = router({
  // 役職マスター管理
  getPositions: protectedProcedure
    .input(
      z.object({
        facility_id: z.string().optional(),
        is_active: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetPositionsDto = input || {};
        const positionsRepository = createRepository(ctx.supabase);
        const result = await positionsRepository.getPositions(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '役職の取得中にエラーが発生しました',
        });
      }
    }),

  getPosition: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const positionsRepository = createRepository(ctx.supabase);
        const result = await positionsRepository.getPosition(input.id);
        if (!result) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '役職が見つかりません',
          });
        }
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : '役職の取得中にエラーが発生しました',
        });
      }
    }),

  createPosition: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, '役職名を入力してください'),
        description: z.string().optional(),
        level: z.number().min(1).max(10),
        color_code: z.string().max(20).optional(),
        facility_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreatePositionDto = input;
        const positionsRepository = createRepository(ctx.supabase);
        const result = await positionsRepository.createPosition(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '役職の作成中にエラーが発生しました',
        });
      }
    }),

  updatePosition: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        level: z.number().min(1).max(10).optional(),
        color_code: z.string().max(20).optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdatePositionDto = input;
        const positionsRepository = createRepository(ctx.supabase);
        const result = await positionsRepository.updatePosition(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '役職の更新中にエラーが発生しました',
        });
      }
    }),

  deletePosition: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const positionsRepository = createRepository(ctx.supabase);
        await positionsRepository.deletePosition(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '役職の削除中にエラーが発生しました',
        });
      }
    }),

  // 職員役職管理
  getUserPositions: protectedProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        position_id: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetUserPositionsDto = input;
        const positionsRepository = createRepository(ctx.supabase);
        const result = await positionsRepository.getUserPositions(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '職員役職の取得中にエラーが発生しました',
        });
      }
    }),

  createUserPosition: protectedProcedure
    .input(
      z.object({
        user_id: z.string(),
        position_id: z.string(),
        assigned_by: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateUserPositionDto = input;
        const positionsRepository = createRepository(ctx.supabase);
        const result = await positionsRepository.createUserPosition(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '職員役職の作成中にエラーが発生しました',
        });
      }
    }),

  deleteUserPosition: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const positionsRepository = createRepository(ctx.supabase);
        await positionsRepository.deleteUserPosition(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '職員役職の削除中にエラーが発生しました',
        });
      }
    }),
});
