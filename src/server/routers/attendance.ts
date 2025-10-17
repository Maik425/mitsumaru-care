import type {
  CreateAttendanceRecordDto,
  CreateAttendanceRequestDto,
  CreateShiftDto,
  CreateUserShiftDto,
  GetAttendanceRecordsDto,
  GetAttendanceRequestsDto,
  GetShiftsDto,
  GetUserShiftsDto,
  UpdateAttendanceRecordDto,
  UpdateAttendanceRequestDto,
  UpdateShiftDto,
} from '@/lib/dto/attendance.dto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  AttendanceRepository,
  SupabaseAttendanceDataSource,
} from '@/data/attendance';

import { publicProcedure, router } from '../trpc';

const createRepository = (client: SupabaseClient) =>
  new AttendanceRepository(new SupabaseAttendanceDataSource(client));

export const attendanceRouter = router({
  // 勤怠記録関連
  getAttendanceRecords: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        date: z.string().optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        status: z
          .enum(['pending', 'approved', 'rejected', 'correction_requested'])
          .optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetAttendanceRecordsDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getAttendanceRecords(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '勤怠記録の取得中にエラーが発生しました',
        });
      }
    }),

  getAttendanceRecord: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getAttendanceRecord(input.id);
        if (!result) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '勤怠記録が見つかりません',
          });
        }
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : '勤怠記録の取得中にエラーが発生しました',
        });
      }
    }),

  createAttendanceRecord: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        date: z.string(),
        shift_id: z.string().optional(),
        scheduled_start_time: z.string().optional(),
        scheduled_end_time: z.string().optional(),
        actual_start_time: z.string().optional(),
        actual_end_time: z.string().optional(),
        break_duration: z.number().default(60),
        overtime_duration: z.number().default(0),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateAttendanceRecordDto = input;

        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.createAttendanceRecord(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '勤怠記録の作成中にエラーが発生しました',
        });
      }
    }),

  updateAttendanceRecord: publicProcedure
    .input(
      z.object({
        id: z.string(),
        actual_start_time: z.string().optional(),
        actual_end_time: z.string().optional(),
        break_duration: z.number().optional(),
        overtime_duration: z.number().optional(),
        status: z
          .enum(['pending', 'approved', 'rejected', 'correction_requested'])
          .optional(),
        notes: z.string().optional(),
        approved_by: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateAttendanceRecordDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.updateAttendanceRecord(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '勤怠記録の更新中にエラーが発生しました',
        });
      }
    }),

  deleteAttendanceRecord: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const attendanceRepository = createRepository(ctx.supabase);
        await attendanceRepository.deleteAttendanceRecord(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '勤怠記録の削除中にエラーが発生しました',
        });
      }
    }),

  // 勤怠申請関連
  getAttendanceRequests: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        type: z
          .enum(['clock_correction', 'overtime', 'work_time_change'])
          .optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetAttendanceRequestsDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getAttendanceRequests(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '勤怠申請の取得中にエラーが発生しました',
        });
      }
    }),

  getAttendanceRequest: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getAttendanceRequest(
          input.id
        );
        if (!result) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '勤怠申請が見つかりません',
          });
        }
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : '勤怠申請の取得中にエラーが発生しました',
        });
      }
    }),

  createAttendanceRequest: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        type: z.enum(['clock_correction', 'overtime', 'work_time_change']),
        target_date: z.string(),
        original_start_time: z.string().optional(),
        original_end_time: z.string().optional(),
        requested_start_time: z.string().optional(),
        requested_end_time: z.string().optional(),
        reason: z.string().min(1, '理由を入力してください'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateAttendanceRequestDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.createAttendanceRequest(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : '勤怠申請の作成中にエラーが発生しました',
        });
      }
    }),

  updateAttendanceRequest: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['approved', 'rejected']),
        reviewed_by: z.string(),
        review_notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateAttendanceRequestDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.updateAttendanceRequest(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '勤怠申請の更新中にエラーが発生しました',
        });
      }
    }),

  deleteAttendanceRequest: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const attendanceRepository = createRepository(ctx.supabase);
        await attendanceRepository.deleteAttendanceRequest(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '勤怠申請の削除中にエラーが発生しました',
        });
      }
    }),

  // シフト関連
  getShifts: publicProcedure
    .input(
      z.object({
        facility_id: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetShiftsDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getShifts(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'シフトの取得中にエラーが発生しました',
        });
      }
    }),

  getShift: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getShift(input.id);
        if (!result) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'シフトが見つかりません',
          });
        }
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            error instanceof Error
              ? error.message
              : 'シフトの取得中にエラーが発生しました',
        });
      }
    }),

  createShift: publicProcedure
    .input(
      z.object({
        name: z.string(),
        start_time: z.string(),
        end_time: z.string(),
        break_duration: z.number().optional(),
        facility_id: z.string(),
        color_code: z.string().max(20).optional(),
        description: z.string().max(1000).optional(),
        is_night_shift: z.boolean().optional(),
        sort_order: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateShiftDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.createShift(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'シフトの作成中にエラーが発生しました',
        });
      }
    }),

  updateShift: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        start_time: z.string().optional(),
        end_time: z.string().optional(),
        break_duration: z.number().optional(),
        is_active: z.boolean().optional(),
        color_code: z.string().max(20).optional(),
        description: z.string().max(1000).optional(),
        is_night_shift: z.boolean().optional(),
        sort_order: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: UpdateShiftDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.updateShift(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'シフトの更新中にエラーが発生しました',
        });
      }
    }),

  deleteShift: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const attendanceRepository = createRepository(ctx.supabase);
        await attendanceRepository.deleteShift(input.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'シフトの削除中にエラーが発生しました',
        });
      }
    }),

  // ユーザーシフト関連
  getUserShifts: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        date: z.string().optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const dto: GetUserShiftsDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getUserShifts(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'ユーザーシフトの取得中にエラーが発生しました',
        });
      }
    }),

  createUserShift: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        shift_id: z.string(),
        date: z.string(),
        is_working: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const dto: CreateUserShiftDto = input;
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.createUserShift(dto);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'ユーザーシフトの作成中にエラーが発生しました',
        });
      }
    }),

  // 統計関連
  getMonthlyAttendanceStats: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        year: z.number(),
        month: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getMonthlyAttendanceStats(
          input.user_id,
          input.year,
          input.month
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '月次勤怠統計の取得中にエラーが発生しました',
        });
      }
    }),

  // 現在勤務中の職員一覧
  getCurrentlyWorkingStaff: publicProcedure
    .input(
      z.object({
        facility_id: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const attendanceRepository = createRepository(ctx.supabase);
        const result = await attendanceRepository.getCurrentlyWorkingStaff({
          facilityId: input.facility_id,
        });
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '勤務中職員一覧の取得中にエラーが発生しました',
        });
      }
    }),
});
