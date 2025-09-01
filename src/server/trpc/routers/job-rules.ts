import { router, protectedProcedure, adminProcedure } from '../middleware/auth';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const createSchema = z.object({
  tenantId: z.string(),
  name: z.string().min(1),
  shiftTypeId: z.string(),
  requiredPositions: z.unknown().default([]).optional(),
});

export const jobRulesRouter = router({
  create: adminProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId, name, shiftTypeId, requiredPositions } = input;
      // 参照チェック（存在確認）
      const shiftType = await ctx.prisma.shiftType.findFirst({
        where: { id: shiftTypeId, tenantId },
      });
      if (!shiftType)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'invalid shiftTypeId',
        });
      return ctx.prisma.jobRule.create({
        data: {
          tenantId,
          name,
          shiftTypeId,
          requiredPositions: requiredPositions ?? undefined,
        },
      });
    }),

  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.string(),
        includeInactive: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
        sortBy: z.enum(['createdAt', 'name']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        tenantId,
        includeInactive,
        limit,
        offset,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = input;
      return ctx.prisma.jobRule.findMany({
        where: { tenantId, ...(includeInactive ? {} : { isActive: true }) },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        tenantId: z.string(),
        data: z
          .object({
            name: z.string().min(1).optional(),
            requiredPositions: z.unknown().optional(),
            isActive: z.boolean().optional(),
          })
          .refine(d => Object.keys(d).length > 0, '更新項目が必要です'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId, data } = input;
      const found = await ctx.prisma.jobRule.findFirst({
        where: { id, tenantId },
      });
      if (!found) throw new TRPCError({ code: 'NOT_FOUND' });
      const updateData: any = { ...data };
      return ctx.prisma.jobRule.update({ where: { id }, data: updateData });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string(), tenantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId } = input;
      const found = await ctx.prisma.jobRule.findFirst({
        where: { id, tenantId },
      });
      if (!found) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.jobRule.delete({ where: { id } });
    }),
});
