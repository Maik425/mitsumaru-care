import { router, protectedProcedure, adminProcedure } from '../middleware/auth';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const categoryEnum = z.enum(['CARE', 'MEDICAL', 'ADMINISTRATIVE', 'OTHER']);

const createSchema = z.object({
  tenantId: z.string(),
  name: z.string().min(1),
  category: categoryEnum,
  description: z.string().optional(),
});

export const skillsRouter = router({
  create: adminProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId, name, category, description } = input;
      return ctx.prisma.skill.create({
        data: { tenantId, name, category, description },
      });
    }),

  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.string(),
        includeInactive: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
        sortBy: z.enum(['createdAt', 'name', 'category']).optional(),
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
      return ctx.prisma.skill.findMany({
        where: { tenantId, ...(includeInactive ? {} : { isActive: true }) },
        orderBy: { [sortBy]: sortOrder as any },
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
            category: categoryEnum.optional(),
            description: z.string().optional(),
            isActive: z.boolean().optional(),
          })
          .refine(d => Object.keys(d).length > 0, '更新項目が必要です'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId, data } = input;
      const found = await ctx.prisma.skill.findFirst({
        where: { id, tenantId },
      });
      if (!found) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.skill.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string(), tenantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId } = input;
      const found = await ctx.prisma.skill.findFirst({
        where: { id, tenantId },
      });
      if (!found) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.skill.delete({ where: { id } });
    }),
});
