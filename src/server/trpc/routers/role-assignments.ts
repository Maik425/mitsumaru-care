import { router, protectedProcedure, adminProcedure } from '../middleware/auth';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// 役割表作成の入力スキーマ
const createRoleAssignmentSchema = z.object({
  tenantId: z.string(),
  shiftId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  details: z.array(
    z.object({
      userId: z.string(),
      roleName: z.string(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      notes: z.string().optional(),
    })
  ),
});

// 役割表更新の入力スキーマ
const updateRoleAssignmentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  data: z
    .object({
      status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED']).optional(),
      details: z
        .array(
          z.object({
            userId: z.string(),
            roleName: z.string(),
            startTime: z.string().regex(/^\d{2}:\d{2}$/),
            endTime: z.string().regex(/^\d{2}:\d{2}$/),
            notes: z.string().optional(),
          })
        )
        .optional(),
    })
    .refine(d => Object.keys(d).length > 0, '更新項目が必要です'),
});

export const roleAssignmentsRouter = router({
  // 役割表作成
  create: adminProcedure
    .input(createRoleAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId, shiftId, date, details } = input;

      try {
        // 既存の役割表があるかチェック
        const existingRoleAssignment =
          await ctx.prisma.roleAssignment.findFirst({
            where: { tenantId, date: new Date(date) },
          });

        if (existingRoleAssignment) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '指定された日付の役割表は既に存在します',
          });
        }

        // シフトの存在確認
        const shift = await ctx.prisma.shift.findFirst({
          where: { id: shiftId, tenantId },
        });

        if (!shift) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '無効なシフトIDです',
          });
        }

        // ユーザーの存在確認
        const userIds = details.map(d => d.userId);
        const users = await ctx.prisma.user.findMany({
          where: { id: { in: userIds } },
        });

        if (users.length !== userIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '無効なユーザーが含まれています',
          });
        }

        // 役割表を作成
        const roleAssignment = await ctx.prisma.roleAssignment.create({
          data: {
            tenantId,
            shiftId,
            date: new Date(date),
            details: {
              create: details.map(detail => ({
                userId: detail.userId,
                roleName: detail.roleName,
                startTime: detail.startTime,
                endTime: detail.endTime,
                notes: detail.notes,
              })),
            },
          },
          include: {
            shift: {
              include: {
                shiftType: true,
              },
            },
            details: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    employeeNumber: true,
                  },
                },
              },
            },
          },
        });

        return roleAssignment;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役割表の作成中にエラーが発生しました',
        });
      }
    }),

  // 役割表取得
  get: protectedProcedure
    .input(
      z.object({
        tenantId: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const { tenantId, date } = input;

      try {
        const roleAssignment = await ctx.prisma.roleAssignment.findFirst({
          where: {
            tenantId,
            date: new Date(date),
          },
          include: {
            shift: {
              include: {
                shiftType: true,
              },
            },
            details: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    employeeNumber: true,
                  },
                },
              },
            },
          },
        });

        return roleAssignment;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役割表の取得中にエラーが発生しました',
        });
      }
    }),

  // 役割表更新
  update: adminProcedure
    .input(updateRoleAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId, data } = input;

      try {
        // 既存の役割表を確認
        const existingRoleAssignment =
          await ctx.prisma.roleAssignment.findFirst({
            where: { id, tenantId },
          });

        if (!existingRoleAssignment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '指定された役割表が見つかりません',
          });
        }

        // 役割表を更新
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (data.status) {
          updateData.status = data.status;
        }

        if (data.details) {
          // 既存のdetailsを削除して新しいものを作成
          updateData.details = {
            deleteMany: {},
            create: data.details.map(detail => ({
              userId: detail.userId,
              roleName: detail.roleName,
              startTime: detail.startTime,
              endTime: detail.endTime,
              notes: detail.notes,
            })),
          };
        }

        const updatedRoleAssignment = await ctx.prisma.roleAssignment.update({
          where: { id },
          data: updateData,
          include: {
            shift: {
              include: {
                shiftType: true,
              },
            },
            details: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    employeeNumber: true,
                  },
                },
              },
            },
          },
        });

        return updatedRoleAssignment;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役割表の更新中にエラーが発生しました',
        });
      }
    }),

  // 役割表削除
  delete: adminProcedure
    .input(z.object({ id: z.string(), tenantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId } = input;

      try {
        // 既存の役割表を確認
        const existingRoleAssignment =
          await ctx.prisma.roleAssignment.findFirst({
            where: { id, tenantId },
          });

        if (!existingRoleAssignment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '指定された役割表が見つかりません',
          });
        }

        // 役割表を削除
        await ctx.prisma.roleAssignment.delete({
          where: { id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役割表の削除中にエラーが発生しました',
        });
      }
    }),

  // 役割表一覧取得
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

        const roleAssignments = await ctx.prisma.roleAssignment.findMany({
          where,
          include: {
            shift: {
              include: {
                shiftType: true,
              },
            },
            _count: {
              select: { details: true },
            },
          },
          orderBy: { date: 'asc' },
          take: limit,
          skip: offset,
        });

        return roleAssignments;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役割表一覧の取得中にエラーが発生しました',
        });
      }
    }),
});
