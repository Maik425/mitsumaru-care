import { router, protectedProcedure, adminProcedure } from '../middleware/auth';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// 出退勤打刻の入力スキーマ
const checkInOutSchema = z.object({
  tenantId: z.string(),
  shiftId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(['CHECK_IN', 'CHECK_OUT']),
  notes: z.string().optional(),
});

// 勤怠記録取得の入力スキーマ
const getAttendanceSchema = z.object({
  tenantId: z.string(),
  userId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// 勤怠申請の入力スキーマ
const requestAttendanceSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['LATE', 'EARLY_LEAVE', 'OVERTIME', 'ABSENT']),
  reason: z.string(),
  requestedStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  requestedEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
});

export const attendanceRouter = router({
  // 出退勤打刻
  checkInOut: protectedProcedure
    .input(checkInOutSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId, shiftId, date, time, type, notes } = input;

      try {
        // シフトの存在確認
        const shift = await ctx.prisma.shift.findFirst({
          where: { id: shiftId, tenantId },
          include: {
            shiftType: true,
          },
        });

        if (!shift) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '無効なシフトIDです',
          });
        }

        // 既存の勤怠記録を確認
        const existingAttendance = await ctx.prisma.attendance.findFirst({
          where: {
            tenantId,
            userId: ctx.user.id,
            shiftId,
            date: new Date(date),
          },
        });

        let attendance;
        if (existingAttendance) {
          // 既存の記録を更新
          attendance = await ctx.prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              ...(type === 'CHECK_IN' && { checkInTime: time }),
              ...(type === 'CHECK_OUT' && { checkOutTime: time }),
              status: type === 'CHECK_IN' ? 'CHECKED_IN' : 'CHECKED_OUT',
              updatedAt: new Date(),
            },
          });
        } else {
          // 新しい記録を作成
          attendance = await ctx.prisma.attendance.create({
            data: {
              tenantId,
              userId: ctx.user.id,
              shiftId,
              date: new Date(date),
              plannedStartTime: shift.shiftType.startTime,
              plannedEndTime: shift.shiftType.endTime,
              ...(type === 'CHECK_IN' && { actualStartTime: time }),
              ...(type === 'CHECK_OUT' && { actualEndTime: time }),
              status: type === 'CHECK_IN' ? 'CHECKED_IN' : 'CHECKED_OUT',
              notes,
            },
          });
        }

        return attendance;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '出退勤打刻中にエラーが発生しました',
        });
      }
    }),

  // 勤怠記録取得
  get: protectedProcedure
    .input(getAttendanceSchema)
    .query(async ({ ctx, input }) => {
      const { tenantId, userId, startDate, endDate } = input;

      try {
        const where: any = {
          tenantId,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        };

        // 管理者以外は自分の記録のみ
        if (!ctx.user.permissions.includes('ATTENDANCE_MANAGEMENT')) {
          where.userId = ctx.user.id;
        } else if (userId) {
          where.userId = userId;
        }

        const attendances = await ctx.prisma.attendance.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                employeeNumber: true,
              },
            },
            shift: {
              include: {
                shiftType: true,
              },
            },
          },
          orderBy: [{ date: 'desc' }, { actualStartTime: 'asc' }],
        });

        return attendances;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '勤怠記録の取得中にエラーが発生しました',
        });
      }
    }),

  // 勤怠申請
  request: protectedProcedure
    .input(requestAttendanceSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        tenantId,
        userId,
        date,
        type,
        reason,
        requestedStartTime,
        requestedEndTime,
      } = input;

      try {
        // ユーザーが自分自身の申請か、管理者権限があるかチェック
        if (
          userId !== ctx.user.id &&
          !ctx.user.permissions.includes('ATTENDANCE_MANAGEMENT')
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '勤怠申請の権限がありません',
          });
        }

        // 既存の申請があるかチェック
        const existingRequest = await ctx.prisma.attendanceRequest.findFirst({
          where: {
            tenantId,
            userId,
            date: new Date(date),
            type,
            status: { in: ['REQUESTED', 'APPROVED'] },
          },
        });

        if (existingRequest) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '同じ日付・種類の申請が既に存在します',
          });
        }

        // 勤怠申請を作成
        const attendanceRequest = await ctx.prisma.attendanceRequest.create({
          data: {
            tenantId,
            userId,
            date: new Date(date),
            type,
            reason,
            requestedStartTime,
            requestedEndTime,
            status: 'REQUESTED',
          },
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
        });

        return attendanceRequest;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '勤怠申請の作成中にエラーが発生しました',
        });
      }
    }),

  // 勤怠申請承認・却下
  approveReject: adminProcedure
    .input(
      z.object({
        id: z.string(),
        tenantId: z.string(),
        action: z.enum(['APPROVE', 'REJECT']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tenantId, action, notes } = input;

      try {
        // 申請の存在確認
        const request = await ctx.prisma.attendanceRequest.findFirst({
          where: { id, tenantId },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '指定された申請が見つかりません',
          });
        }

        // 申請を更新
        const updatedRequest = await ctx.prisma.attendanceRequest.update({
          where: { id },
          data: {
            status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            approvedBy: ctx.user.id,
            approvedAt: new Date(),
            notes,
          },
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
        });

        return updatedRequest;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '申請の処理中にエラーが発生しました',
        });
      }
    }),

  // 勤怠集計
  summary: adminProcedure
    .input(
      z.object({
        tenantId: z.string(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { tenantId, startDate, endDate, userId } = input;

      try {
        const where: any = {
          tenantId,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        };

        if (userId) {
          where.userId = userId;
        }

        const attendances = await ctx.prisma.attendance.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                employeeNumber: true,
              },
            },
            shift: {
              include: {
                shiftType: true,
              },
            },
          },
        });

        // 集計処理
        const summary = attendances.reduce(
          (acc, attendance) => {
            const userId = attendance.userId;
            if (!acc[userId]) {
              acc[userId] = {
                user: attendance.user,
                totalDays: 0,
                totalHours: 0,
                lateCount: 0,
                earlyLeaveCount: 0,
                overtimeCount: 0,
              };
            }

            acc[userId].totalDays++;
            // 勤務時間の計算（簡易版）
            if (attendance.actualStartTime && attendance.actualEndTime) {
              const start = new Date(
                `2000-01-01T${attendance.actualStartTime}`
              );
              const end = new Date(`2000-01-01T${attendance.actualEndTime}`);
              const hours =
                (end.getTime() - start.getTime()) / (1000 * 60 * 60);
              acc[userId].totalHours += hours;
            }

            // 遅刻・早退・残業の判定（簡易版）
            if (attendance.status === 'LATE') acc[userId].lateCount++;
            if (attendance.status === 'EARLY_LEAVE')
              acc[userId].earlyLeaveCount++;
            if (attendance.status === 'OVERTIME') acc[userId].overtimeCount++;

            return acc;
          },
          {} as Record<string, any>
        );

        return Object.values(summary);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '勤怠集計の取得中にエラーが発生しました',
        });
      }
    }),
});
