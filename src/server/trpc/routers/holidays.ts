import { z } from 'zod';
import { protectedProcedure, adminProcedure, publicProcedure } from '../trpc';

// 休日作成のスキーマ
const createHolidaySchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  date: z.string(),
  type: z.enum(['PUBLIC_HOLIDAY', 'COMPANY_HOLIDAY', 'PERSONAL_HOLIDAY']),
  reason: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
});

// 休日更新のスキーマ
const updateHolidaySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  data: z.object({
    type: z
      .enum(['PUBLIC_HOLIDAY', 'COMPANY_HOLIDAY', 'PERSONAL_HOLIDAY'])
      .optional(),
    reason: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  }),
});

export const holidaysRouter = {
  // 休日作成
  create: protectedProcedure
    .input(createHolidaySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const holiday = await ctx.prisma.holiday.create({
          data: {
            tenantId: input.tenantId,
            userId: input.userId,
            date: new Date(input.date),
            type: input.type,
            reason: input.reason,
            status: input.status,
          },
        });
        return holiday;
      } catch (error) {
        throw new Error('休日の作成に失敗しました');
      }
    }),

  // 休日更新
  update: protectedProcedure
    .input(updateHolidaySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const holiday = await ctx.prisma.holiday.update({
          where: { id: input.id },
          data: input.data,
        });
        return holiday;
      } catch (error) {
        throw new Error('休日の更新に失敗しました');
      }
    }),

  // 休日一覧取得
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.string(),
        userId: z.string().optional(),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: any = {
          tenantId: input.tenantId,
        };

        if (input.userId) {
          where.userId = input.userId;
        }

        if (input.status) {
          where.status = input.status;
        }

        if (input.startDate && input.endDate) {
          where.date = {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          };
        }

        const holidays = await ctx.prisma.holiday.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
        });

        return holidays;
      } catch (error) {
        throw new Error('休日一覧の取得に失敗しました');
      }
    }),

  // 休日詳細取得
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const holiday = await ctx.prisma.holiday.findUnique({
          where: { id: input.id },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        if (!holiday) {
          throw new Error('休日が見つかりません');
        }

        return holiday;
      } catch (error) {
        throw new Error('休日の取得に失敗しました');
      }
    }),

  // 休日承認（管理者のみ）
  approve: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['APPROVED', 'REJECTED']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const holiday = await ctx.prisma.holiday.update({
          where: { id: input.id },
          data: {
            status: input.status,
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
            adminNotes: input.notes,
          },
        });
        return holiday;
      } catch (error) {
        throw new Error('休日の承認に失敗しました');
      }
    }),

  // 休日削除
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.holiday.delete({
          where: { id: input.id },
        });
        return { success: true };
      } catch (error) {
        throw new Error('休日の削除に失敗しました');
      }
    }),
};
