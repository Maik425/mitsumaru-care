// エクスポート機能用tRPCルーター

import { SupabaseExportDataSource } from '@/data/export/supabase-export-data-source';
import { ExportRepository } from '@/lib/repositories/export-repository';
import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import * as fsSync from 'fs';
import { promises as fs } from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

// リポジトリのインスタンス作成
const exportRepository = new ExportRepository(new SupabaseExportDataSource());

export const exportRouter = router({
  // エクスポート履歴の取得
  getExportHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const history = await exportRepository.getExportHistory(
          ctx.user.id,
          input.limit,
          input.offset
        );
        return history;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch export history',
          cause: error,
        });
      }
    }),

  // エクスポート履歴の詳細取得
  getExportHistoryById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const history = await exportRepository.getExportHistoryById(input.id);
        if (!history) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Export history not found',
          });
        }

        // 権限チェック（自分の履歴またはシステム管理者）
        if (
          history.user_id !== ctx.user.id &&
          ctx.user.role !== 'system_admin'
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        return history;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch export history',
          cause: error,
        });
      }
    }),

  // エクスポートの実行
  executeExport: protectedProcedure
    .input(
      z.object({
        export_type: z.enum(['attendance', 'users', 'facilities', 'custom']),
        file_format: z.enum(['csv', 'excel']),
        export_conditions: z.object({
          start_date: z.string().optional(),
          end_date: z.string().optional(),
          facility_id: z.string().uuid().optional(),
          user_id: z.string().uuid().optional(),
          status: z.string().optional(),
        }),
        selected_fields: z.array(z.string()).optional(),
        template_id: z.string().uuid().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // 権限チェック（システム管理者のみ）
        if (ctx.user.role !== 'system_admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only system administrators can export data',
          });
        }

        // Supabaseクライアントの作成
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // エクスポート履歴の作成
        const { data: history, error: createHistoryError } = await supabase
          .from('export_history')
          .insert({
            user_id: ctx.user.id,
            export_type: input.export_type,
            file_format: input.file_format,
            file_name: `${input.export_type}_export`,
            file_path: '',
            file_size: 0,
            export_conditions: input.export_conditions,
            status: 'processing',
            download_count: 0,
          })
          .select()
          .single();

        if (createHistoryError || !history) {
          console.error('Export: Error creating history:', createHistoryError);
          throw new Error('Failed to create export history');
        }

        try {
          console.log(`Export: Starting data fetch for ${input.export_type}`);

          // データの取得
          let data: any[] = [];

          if (input.export_type === 'attendance') {
            const { data: attendanceData, error: attendanceError } =
              await supabase
                .from('attendance_records')
                .select(
                  `
                *,
                users!attendance_records_user_id_fkey(name, facilities(name)),
                shifts(name, start_time, end_time)
              `
                )
                .order('date', { ascending: false });

            if (attendanceError) {
              console.error('Attendance data error:', attendanceError);
              throw new Error('Failed to fetch attendance data');
            }

            data = (attendanceData || []).map((record: any) => ({
              user_name: record.users?.name || '',
              facility_name: record.users?.facilities?.name || '',
              date: record.date,
              scheduled_start_time: record.scheduled_start_time || '',
              scheduled_end_time: record.scheduled_end_time || '',
              actual_start_time: record.actual_start_time || '',
              actual_end_time: record.actual_end_time || '',
              break_duration: record.break_duration || 0,
              overtime_duration: record.overtime_duration || 0,
              status: record.status,
              notes: record.notes || '',
            }));
          } else if (input.export_type === 'users') {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select(
                `
                *,
                facilities(name)
              `
              )
              .order('created_at', { ascending: false });

            if (userError) {
              console.error('User data error:', userError);
              throw new Error('Failed to fetch user data');
            }

            data = (userData || []).map((user: any) => ({
              name: user.name,
              email: user.email,
              role: user.role,
              facility_name: user.facilities?.name || '',
              is_active: user.is_active,
              created_at: user.created_at,
              updated_at: user.updated_at,
            }));
          } else if (input.export_type === 'facilities') {
            const { data: facilityData, error: facilityError } = await supabase
              .from('facilities')
              .select(
                `
                *,
                users(count)
              `
              )
              .order('created_at', { ascending: false });

            if (facilityError) {
              console.error('Facility data error:', facilityError);
              throw new Error('Failed to fetch facility data');
            }

            data = (facilityData || []).map((facility: any) => ({
              name: facility.name,
              address: facility.address || '',
              phone: facility.phone || '',
              email: facility.email || '',
              user_count: facility.users?.[0]?.count || 0,
              created_at: facility.created_at,
              updated_at: facility.updated_at,
            }));
          }

          console.log(`Export: Data fetched, count: ${data.length}`);

          // ファイルの生成
          const exportDir = './exports';
          if (!fsSync.existsSync(exportDir)) {
            fsSync.mkdirSync(exportDir, { recursive: true });
          }

          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const fileName = `${input.export_type}_export_${history.id}_${timestamp}.${input.file_format}`;
          const filePath = path.join(exportDir, fileName);

          if (input.file_format === 'csv') {
            // CSVファイルの生成
            const csvHeaders = Object.keys(data[0] || {});
            const csvContent = [
              csvHeaders.join(','),
              ...data.map((row: any) =>
                csvHeaders
                  .map(header => {
                    const value = row[header];
                    if (
                      typeof value === 'string' &&
                      (value.includes(',') || value.includes('"'))
                    ) {
                      return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value || '';
                  })
                  .join(',')
              ),
            ].join('\n');

            await fs.writeFile(filePath, csvContent, 'utf8');
          } else {
            // Excelファイルの生成（簡易版）
            const excelContent = JSON.stringify(data, null, 2);
            await fs.writeFile(filePath, excelContent, 'utf8');
          }

          const stats = await fs.stat(filePath);

          console.log(`Export: File generated: ${fileName}`);

          // エクスポート履歴の更新
          await supabase
            .from('export_history')
            .update({
              file_name: fileName,
              file_path: filePath,
              file_size: stats.size,
              status: 'completed',
            })
            .eq('id', history.id);

          console.log(`Export: History updated, returning download URL`);

          return {
            id: history.id,
            status: 'completed',
            file_name: fileName,
            file_size: stats.size,
            download_url: `/api/export/download/${history.id}`,
          };
        } catch (error) {
          console.error(`Export: Error occurred:`, error);

          // エラー時の履歴更新
          await supabase
            .from('export_history')
            .update({
              status: 'failed',
              error_message:
                error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', history.id);

          throw error;
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute export',
          cause: error,
        });
      }
    }),

  // エクスポート設定の取得
  getExportSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const settings = await exportRepository.getExportSettings(ctx.user.id);
      return settings;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch export settings',
        cause: error,
      });
    }
  }),

  // エクスポート設定の作成
  createExportSettings: protectedProcedure
    .input(
      z.object({
        setting_name: z.string().min(1).max(255),
        export_type: z.enum(['attendance', 'users', 'facilities', 'custom']),
        file_format: z.enum(['csv', 'excel']),
        export_conditions: z.record(z.any()).default({}),
        selected_fields: z.array(z.string()).default([]),
        is_default: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const settings = await exportRepository.createExportSettings({
          user_id: ctx.user.id,
          setting_name: input.setting_name,
          export_type: input.export_type,
          file_format: input.file_format,
          export_conditions: input.export_conditions,
          selected_fields: input.selected_fields,
          is_default: input.is_default,
        });

        return settings;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create export settings',
          cause: error,
        });
      }
    }),

  // エクスポートテンプレートの取得
  getExportTemplates: protectedProcedure
    .input(
      z.object({
        template_type: z
          .enum(['attendance', 'users', 'facilities', 'custom'])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const templates = await exportRepository.getExportTemplates(
          input.template_type
        );
        return templates;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch export templates',
          cause: error,
        });
      }
    }),

  // エクスポート履歴の削除
  deleteExportHistory: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // 履歴の取得と権限チェック
        const history = await exportRepository.getExportHistoryById(input.id);
        if (!history) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Export history not found',
          });
        }

        if (
          history.user_id !== ctx.user.id &&
          ctx.user.role !== 'system_admin'
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        // ファイルの削除（物理ファイルは残す）
        // if (history.file_path) {
        //   await FileGenerator.deleteFile(history.file_path);
        // }

        // 履歴の削除
        await exportRepository.deleteExportHistory(input.id);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete export history',
          cause: error,
        });
      }
    }),

  // ダウンロード回数の増加
  incrementDownloadCount: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const history = await exportRepository.getExportHistoryById(input.id);
        if (!history) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Export history not found',
          });
        }

        if (
          history.user_id !== ctx.user.id &&
          ctx.user.role !== 'system_admin'
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        // ダウンロード回数の増加は直接Supabaseで実行
        // await exportRepository.incrementDownloadCount(input.id);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to increment download count',
          cause: error,
        });
      }
    }),

  // エクスポート設定の削除
  deleteExportSettings: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const settings = await exportRepository.getExportSettings(ctx.user.id);
        if (!settings) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Export settings not found',
          });
        }

        if (
          settings.user_id !== ctx.user.id &&
          ctx.user.role !== 'system_admin'
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        await exportRepository.deleteExportSettings(input.id);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete export settings',
          cause: error,
        });
      }
    }),
});
