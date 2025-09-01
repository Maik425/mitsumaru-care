import { router, protectedProcedure, adminProcedure } from '../middleware/auth';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const baseFields = {
  tenantId: z.string(),
  name: z.string().min(1),
  // HH:MM 24時間表記
  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      'startTimeはHH:MM形式で指定してください'
    ),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'endTimeはHH:MM形式で指定してください'),
  breakTime: z.number().int().min(0).default(0).optional(),
  color: z.string().default('#2563eb').optional(),
};

export const shiftTypesRouter = router({
  create: adminProcedure
    .input(z.object(baseFields))
    .mutation(async ({ ctx, input }) => {
      const {
        tenantId,
        name,
        startTime,
        endTime,
        breakTime = 0,
        color = '#2563eb',
      } = input;
      return ctx.prisma.shiftType.create({
        data: { tenantId, name, startTime, endTime, breakTime, color },
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
      return ctx.prisma.shiftType.findMany({
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
            startTime: z
              .string()
              .regex(
                /^([01]\d|2[0-3]):[0-5]\d$/,
                'startTimeはHH:MM形式で指定してください'
              )
              .optional(),
            endTime: z
              .string()
              .regex(
                /^([01]\d|2[0-3]):[0-5]\d$/,
                'endTimeはHH:MM形式で指定してください'
              )
              .optional(),
            breakTime: z.number().int().min(0).optional(),
            color: z.string().optional(),
            isActive: z.boolean().optional(),
          })
          .refine(d => Object.keys(d).length > 0, '更新項目が必要です'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId, data } = input;
      const found = await ctx.prisma.shiftType.findFirst({
        where: { id, tenantId },
      });
      if (!found) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.shiftType.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string(), tenantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId } = input;
      const found = await ctx.prisma.shiftType.findFirst({
        where: { id, tenantId },
      });
      if (!found) throw new TRPCError({ code: 'NOT_FOUND' });
      return ctx.prisma.shiftType.delete({ where: { id } });
    }),
});
