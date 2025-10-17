import type {
  CreateSkillDto,
  CreateUserSkillDto,
  GetSkillsDto,
  GetUserSkillsDto,
  UpdateSkillDto,
  UpdateUserSkillDto,
} from '@/lib/dto/skills.dto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { SkillsRepository, SupabaseSkillsDataSource } from '@/lib/repositories';

import { publicProcedure, router } from '../trpc';

const createRepository = (client: SupabaseClient) =>
  new SkillsRepository(new SupabaseSkillsDataSource(client));

export const skillsRouter = router({
  // 技能マスター管理
  getSkills: publicProcedure
    .input(
      z.object({
        facility_id: z.string().optional(),
        category: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetSkillsDto = input;
        const skillsRepository = createRepository(ctx.supabase);
        const result = await skillsRepository.getSkills(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '技能の取得中にエラーが発生しました',
        });
      }
    }),

  getSkill: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const skillsRepository = createRepository(ctx.supabase);
        const result = await skillsRepository.getSkill(input.id);
        if (!result) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '技能が見つかりません',
          });
        }
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : '技能の取得中にエラーが発生しました',
        });
      }
    }),

  createSkill: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, '技能名を入力してください'),
        category: z.string().min(1, 'カテゴリを入力してください'),
        level: z.number().min(1).max(5),
        description: z.string().optional(),
        facility_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateSkillDto = input;
        const skillsRepository = createRepository(ctx.supabase);
        const result = await skillsRepository.createSkill(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '技能の作成中にエラーが発生しました',
        });
      }
    }),

  updateSkill: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        level: z.number().min(1).max(5).optional(),
        description: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateSkillDto = input;
        const skillsRepository = createRepository(ctx.supabase);
        const result = await skillsRepository.updateSkill(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '技能の更新中にエラーが発生しました',
        });
      }
    }),

  deleteSkill: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const skillsRepository = createRepository(ctx.supabase);
        await skillsRepository.deleteSkill(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '技能の削除中にエラーが発生しました',
        });
      }
    }),

  // 職員技能管理
  getUserSkills: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        skill_id: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetUserSkillsDto = input;
        const skillsRepository = createRepository(ctx.supabase);
        const result = await skillsRepository.getUserSkills(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '職員技能の取得中にエラーが発生しました',
        });
      }
    }),

  createUserSkill: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        skill_id: z.string(),
        level: z.number().min(1).max(5),
        experience_years: z.number().min(0),
        certified: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateUserSkillDto = input;
        const skillsRepository = createRepository(ctx.supabase);
        const result = await skillsRepository.createUserSkill(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '職員技能の作成中にエラーが発生しました',
        });
      }
    }),

  updateUserSkill: publicProcedure
    .input(
      z.object({
        id: z.string(),
        level: z.number().min(1).max(5).optional(),
        experience_years: z.number().min(0).optional(),
        certified: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateUserSkillDto = input;
        const skillsRepository = createRepository(ctx.supabase);
        const result = await skillsRepository.updateUserSkill(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '職員技能の更新中にエラーが発生しました',
        });
      }
    }),

  deleteUserSkill: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const skillsRepository = createRepository(ctx.supabase);
        await skillsRepository.deleteUserSkill(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '職員技能の削除中にエラーが発生しました',
        });
      }
    }),
});
