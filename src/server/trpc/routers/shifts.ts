import { router, protectedProcedure, adminProcedure } from '../middleware/auth';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// シフト作成の入力スキーマ
const createShiftSchema = z.object({
  tenantId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shiftTypeId: z.string(),
  assignedUsers: z.array(
    z.object({
      userId: z.string(),
      positionId: z.string(),
    })
  ),
});

// シフト取得の入力スキーマ
const getShiftSchema = z.object({
  tenantId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// シフト更新の入力スキーマ
const updateShiftSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  data: z
    .object({
      shiftTypeId: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED']).optional(),
    })
    .refine(d => Object.keys(d).length > 0, '更新項目が必要です'),
});

export const shiftsRouter = router({
  // シフト作成
  create: adminProcedure
    .input(createShiftSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId, date, shiftTypeId, assignedUsers } = input;

      try {
        // 既存のシフトがあるかチェック
        const existingShift = await ctx.prisma.shift.findFirst({
          where: { tenantId, date: new Date(date) },
        });

        if (existingShift) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '指定された日付のシフトは既に存在します',
          });
        }

        // シフトタイプの存在確認
        const shiftType = await ctx.prisma.shiftType.findFirst({
          where: { id: shiftTypeId, tenantId },
        });

        if (!shiftType) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '無効なシフトタイプです',
          });
        }

        // ユーザーの存在確認
        const userIds = assignedUsers.map(u => u.userId);
        const users = await ctx.prisma.user.findMany({
          where: { id: { in: userIds } },
        });

        if (users.length !== userIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '無効なユーザーが含まれています',
          });
        }

        // シフトを作成
        const shift = await ctx.prisma.shift.create({
          data: {
            tenantId,
            date: new Date(date),
            shiftTypeId,
            shiftAssignments: {
              create: assignedUsers.map(user => ({
                user: {
                  connect: { id: user.userId },
                },
                position: {
                  connect: { id: user.positionId },
                },
              })),
            },
          },
          include: {
            shiftType: true,
            shiftAssignments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    employeeNumber: true,
                  },
                },
                position: true,
              },
            },
          },
        });

        return shift;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフトの作成中にエラーが発生しました',
        });
      }
    }),

  // シフト取得
  get: protectedProcedure
    .input(getShiftSchema)
    .query(async ({ ctx, input }) => {
      const { tenantId, date } = input;

      try {
        const shift = await ctx.prisma.shift.findFirst({
          where: {
            tenantId,
            date: new Date(date),
          },
          include: {
            shiftType: true,
            shiftAssignments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    employeeNumber: true,
                  },
                },
                position: true,
              },
            },
          },
        });

        return shift;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフトの取得中にエラーが発生しました',
        });
      }
    }),

  // シフト更新
  update: adminProcedure
    .input(updateShiftSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId, data } = input;

      try {
        // 既存のシフトを確認
        const existingShift = await ctx.prisma.shift.findFirst({
          where: { id, tenantId },
        });

        if (!existingShift) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '指定されたシフトが見つかりません',
          });
        }

        // シフトを更新
        const updatedShift = await ctx.prisma.shift.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
          include: {
            shiftType: true,
            shiftAssignments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    employeeNumber: true,
                  },
                },
                position: true,
              },
            },
          },
        });

        return updatedShift;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフトの更新中にエラーが発生しました',
        });
      }
    }),

  // シフト削除
  delete: adminProcedure
    .input(z.object({ id: z.string(), tenantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId } = input;

      try {
        // 既存のシフトを確認
        const existingShift = await ctx.prisma.shift.findFirst({
          where: { id, tenantId },
        });

        if (!existingShift) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '指定されたシフトが見つかりません',
          });
        }

        // シフトを削除
        await ctx.prisma.shift.delete({
          where: { id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフトの削除中にエラーが発生しました',
        });
      }
    }),

  // シフト一覧取得
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.string(),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED']).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { tenantId, startDate, endDate, status, limit, offset } = input;

      try {
        const where: any = { tenantId };
        if (startDate) where.date = { gte: new Date(startDate) };
        if (endDate) where.date = { ...where.date, lte: new Date(endDate) };
        if (status) where.status = status;

        const shifts = await ctx.prisma.shift.findMany({
          where,
          include: {
            shiftType: true,
            _count: {
              select: { shiftAssignments: true },
            },
          },
          orderBy: { date: 'asc' },
          take: limit,
          skip: offset,
        });

        return shifts;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフト一覧の取得中にエラーが発生しました',
        });
      }
    }),
});
