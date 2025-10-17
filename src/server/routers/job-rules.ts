import type {
  CreateAreaDto,
  CreateJobRuleSetDto,
  CreateJobRuleTemplateDto,
  CreateJobTypeDto,
  GetAreasDto,
  GetJobRuleSetsDto,
  GetJobRuleTemplatesDto,
  GetJobTypesDto,
  UpdateAreaDto,
  UpdateJobRuleSetDto,
  UpdateJobRuleTemplateDto,
  UpdateJobTypeDto,
} from '@/lib/dto/job-rules.dto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  JobRulesRepository,
  SupabaseJobRulesDataSource,
} from '@/lib/repositories';

import { publicProcedure, router } from '../trpc';

const createRepository = (client: SupabaseClient) =>
  new JobRulesRepository(new SupabaseJobRulesDataSource(client));

export const jobRulesRouter = router({
  // Job Types
  getJobTypes: publicProcedure
    .input(
      z.object({
        facility_id: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetJobTypesDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.getJobTypes(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '業務種別の取得中にエラーが発生しました',
        });
      }
    }),

  createJobType: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, '業務種別名を入力してください'),
        description: z.string().optional(),
        facility_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateJobTypeDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.createJobType(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '業務種別の作成中にエラーが発生しました',
        });
      }
    }),

  updateJobType: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateJobTypeDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.updateJobType(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '業務種別の更新中にエラーが発生しました',
        });
      }
    }),

  deleteJobType: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const jobRulesRepository = createRepository(ctx.supabase);
        await jobRulesRepository.deleteJobType(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '業務種別の削除中にエラーが発生しました',
        });
      }
    }),

  // Areas
  getAreas: publicProcedure
    .input(
      z.object({
        facility_id: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetAreasDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.getAreas(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'エリアの取得中にエラーが発生しました',
        });
      }
    }),

  createArea: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'エリア名を入力してください'),
        description: z.string().optional(),
        facility_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateAreaDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.createArea(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'エリアの作成中にエラーが発生しました',
        });
      }
    }),

  updateArea: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateAreaDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.updateArea(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'エリアの更新中にエラーが発生しました',
        });
      }
    }),

  deleteArea: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const jobRulesRepository = createRepository(ctx.supabase);
        await jobRulesRepository.deleteArea(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'エリアの削除中にエラーが発生しました',
        });
      }
    }),

  // Job Rule Templates
  getJobRuleTemplates: publicProcedure
    .input(
      z.object({
        facility_id: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetJobRuleTemplatesDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.getJobRuleTemplates(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '配置ルールテンプレートの取得中にエラーが発生しました',
        });
      }
    }),

  createJobRuleTemplate: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'テンプレート名を入力してください'),
        description: z.string().optional(),
        facility_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateJobRuleTemplateDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.createJobRuleTemplate(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '配置ルールテンプレートの作成中にエラーが発生しました',
        });
      }
    }),

  updateJobRuleTemplate: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateJobRuleTemplateDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.updateJobRuleTemplate(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '配置ルールテンプレートの更新中にエラーが発生しました',
        });
      }
    }),

  deleteJobRuleTemplate: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const jobRulesRepository = createRepository(ctx.supabase);
        await jobRulesRepository.deleteJobRuleTemplate(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '配置ルールテンプレートの削除中にエラーが発生しました',
        });
      }
    }),

  // Job Rule Sets
  getJobRuleSets: publicProcedure
    .input(
      z.object({
        template_id: z.string().optional(),
        job_type_id: z.string().optional(),
        area_id: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetJobRuleSetsDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.getJobRuleSets(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '配置ルールセットの取得中にエラーが発生しました',
        });
      }
    }),

  createJobRuleSet: publicProcedure
    .input(
      z.object({
        template_id: z.string(),
        job_type_id: z.string(),
        area_id: z.string(),
        required_skills: z.array(z.string()),
        required_positions: z.array(z.string()),
        min_staff_count: z.number().min(0),
        max_staff_count: z.number().min(0),
        priority: z.number().min(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateJobRuleSetDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.createJobRuleSet(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '配置ルールセットの作成中にエラーが発生しました',
        });
      }
    }),

  updateJobRuleSet: publicProcedure
    .input(
      z.object({
        id: z.string(),
        required_skills: z.array(z.string()).optional(),
        required_positions: z.array(z.string()).optional(),
        min_staff_count: z.number().min(0).optional(),
        max_staff_count: z.number().min(0).optional(),
        priority: z.number().min(0).optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateJobRuleSetDto = input;
        const jobRulesRepository = createRepository(ctx.supabase);
        const result = await jobRulesRepository.updateJobRuleSet(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '配置ルールセットの更新中にエラーが発生しました',
        });
      }
    }),

  deleteJobRuleSet: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const jobRulesRepository = createRepository(ctx.supabase);
        await jobRulesRepository.deleteJobRuleSet(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '配置ルールセットの削除中にエラーが発生しました',
        });
      }
    }),
});
