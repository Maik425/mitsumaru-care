import { FacilityRepository } from '@/lib/repositories/facility.repository';
import { z } from 'zod';
import { router, systemAdminProcedure } from '../trpc';

const facilityRepository = new FacilityRepository();

export const facilitiesRouter = router({
  // 施設一覧取得（システム管理者専用）
  getFacilities: systemAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await facilityRepository.getFacilities(input);
    }),

  // 施設詳細取得（システム管理者専用）
  getFacility: systemAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await facilityRepository.getFacility(input.id);
    }),

  // 施設作成（システム管理者専用）
  createFacility: systemAdminProcedure
    .input(
      z.object({
        name: z.string().min(1, '施設名を入力してください'),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z
          .string()
          .email('有効なメールアドレスを入力してください')
          .optional()
          .or(z.literal('')),
      })
    )
    .mutation(async ({ input }) => {
      // 空文字列をundefinedに変換
      const cleanInput = {
        name: input.name,
        address: input.address || undefined,
        phone: input.phone || undefined,
        email: input.email === '' ? undefined : input.email,
      };
      return await facilityRepository.createFacility(cleanInput);
    }),

  // 施設更新（システム管理者専用）
  updateFacility: systemAdminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, '施設名を入力してください').optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z
          .string()
          .email('有効なメールアドレスを入力してください')
          .optional()
          .or(z.literal('')),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      // 空文字列をundefinedに変換
      const cleanUpdateData = {
        name: updateData.name,
        address: updateData.address || undefined,
        phone: updateData.phone || undefined,
        email: updateData.email === '' ? undefined : updateData.email,
      };
      return await facilityRepository.updateFacility(id, cleanUpdateData);
    }),

  // 施設削除（システム管理者専用）
  deleteFacility: systemAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await facilityRepository.deleteFacility(input);
      return { success: true };
    }),

  // 施設統計取得（システム管理者専用）
  getFacilityStats: systemAdminProcedure
    .input(z.object({ facility_id: z.string().optional() }))
    .query(async ({ input }) => {
      return await facilityRepository.getFacilityStats(input);
    }),
});
