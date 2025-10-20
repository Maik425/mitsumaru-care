import type {
  CreateFacilityDto,
  DeleteFacilityDto,
  FacilitiesListResponseDto,
  FacilityRawData,
  FacilityResponseDto,
  FacilityStatsDto,
  GetFacilitiesDto,
  GetFacilityStatsDto,
  UpdateFacilityDto,
} from '@/lib/dto/facility.dto';
import { supabaseAdmin } from '@/lib/supabase';

export class FacilityRepository {
  private mapRawDataToResponseDto(
    rawData: FacilityRawData[]
  ): FacilityResponseDto[] {
    return rawData.map(facility => ({
      id: facility.id,
      name: facility.name,
      address: facility.address,
      phone: facility.phone,
      email: facility.email,
      created_at: facility.created_at,
      updated_at: facility.updated_at,
    }));
  }

  async getFacilities(
    dto: GetFacilitiesDto
  ): Promise<FacilitiesListResponseDto> {
    try {
      let query = supabaseAdmin!
        .from('facilities')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // 検索機能
      if (dto.search) {
        query = query.or(
          `name.ilike.%${dto.search}%,address.ilike.%${dto.search}%`
        );
      }

      const limit = dto.limit || 10;
      const offset = dto.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`施設一覧の取得に失敗しました: ${error.message}`);
      }

      const facilities = this.mapRawDataToResponseDto((data as any) || []);

      return {
        facilities,
        total: count || 0,
        limit,
        offset,
      };
    } catch (error) {
      throw new Error(`施設一覧の取得中にエラーが発生しました: ${error}`);
    }
  }

  async getFacility(id: string): Promise<FacilityResponseDto> {
    try {
      const { data, error } = await supabaseAdmin
        .from('facilities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`施設の取得に失敗しました: ${error.message}`);
      }

      if (!data) {
        throw new Error('施設が見つかりません');
      }

      const facilities = this.mapRawDataToResponseDto([data as any]);
      return facilities[0];
    } catch (error) {
      throw new Error(`施設の取得中にエラーが発生しました: ${error}`);
    }
  }

  async createFacility(dto: CreateFacilityDto): Promise<FacilityResponseDto> {
    try {
      const { data, error } = await supabaseAdmin
        .from('facilities')
        .insert(dto as any)
        .select()
        .single();

      if (error) {
        throw new Error(`施設の作成に失敗しました: ${error.message}`);
      }

      const facilities = this.mapRawDataToResponseDto([data as any]);
      return facilities[0];
    } catch (error) {
      throw new Error(`施設の作成中にエラーが発生しました: ${error}`);
    }
  }

  async updateFacility(
    id: string,
    dto: UpdateFacilityDto
  ): Promise<FacilityResponseDto> {
    try {
      // 型安全な更新のため、個別フィールドを更新
      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.address !== undefined) updateData.address = dto.address;
      if (dto.phone !== undefined) updateData.phone = dto.phone;
      if (dto.email !== undefined) updateData.email = dto.email;

      const { data, error } = await (supabaseAdmin as any)
        .from('facilities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`施設の更新に失敗しました: ${error.message}`);
      }

      if (!data) {
        throw new Error('施設が見つかりません');
      }

      const facilities = this.mapRawDataToResponseDto([data as any]);
      return facilities[0];
    } catch (error) {
      throw new Error(`施設の更新中にエラーが発生しました: ${error}`);
    }
  }

  async deleteFacility(dto: DeleteFacilityDto): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('facilities')
        .delete()
        .eq('id', dto.id);

      if (error) {
        throw new Error(`施設の削除に失敗しました: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`施設の削除中にエラーが発生しました: ${error}`);
    }
  }

  async getFacilityStats(
    dto: GetFacilityStatsDto
  ): Promise<FacilityStatsDto[]> {
    try {
      let facilitiesQuery = supabaseAdmin.from('facilities').select('id, name');

      if (dto.facility_id) {
        facilitiesQuery = facilitiesQuery.eq('id', dto.facility_id);
      }

      const { data: facilities, error: facilitiesError } =
        await facilitiesQuery;

      if (facilitiesError) {
        throw new Error(
          `施設一覧の取得に失敗しました: ${facilitiesError.message}`
        );
      }

      const stats: FacilityStatsDto[] = [];

      for (const facility of (facilities as any[]) || []) {
        // ユーザー数統計
        const { count: userCount, error: userCountError } = await supabaseAdmin
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('facility_id', facility.id);

        if (userCountError) {
          console.error(
            `ユーザー数取得エラー (施設ID: ${facility.id}):`,
            userCountError
          );
        }

        // アクティブユーザー数統計
        const { count: activeUserCount, error: activeUserCountError } =
          await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('facility_id', facility.id)
            .eq('is_active', true);

        if (activeUserCountError) {
          console.error(
            `アクティブユーザー数取得エラー (施設ID: ${facility.id}):`,
            activeUserCountError
          );
        }

        // 勤怠記録数統計
        const { data: facilityUsers, error: facilityUsersError } =
          await supabaseAdmin
            .from('users')
            .select('id')
            .eq('facility_id', facility.id);

        let attendanceCount = 0;
        if (facilityUsers && facilityUsers.length > 0) {
          const userIds = (facilityUsers as any[]).map(user => user.id);
          const { count, error: attendanceCountError } = await supabaseAdmin
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .in('user_id', userIds);

          if (attendanceCountError) {
            console.error(
              `勤怠記録数取得エラー (施設ID: ${facility.id}):`,
              attendanceCountError
            );
          } else {
            attendanceCount = count || 0;
          }
        }

        // 最後の活動日時
        let lastActivity = null;
        if (facilityUsers && facilityUsers.length > 0) {
          const userIds = (facilityUsers as any[]).map(user => user.id);
          const { data: lastActivityData, error: lastActivityError } =
            await supabaseAdmin
              .from('attendance_records')
              .select('created_at')
              .in('user_id', userIds)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

          if (lastActivityError && lastActivityError.code !== 'PGRST116') {
            console.error(
              `最後の活動日時取得エラー (施設ID: ${facility.id}):`,
              lastActivityError
            );
          } else {
            lastActivity = lastActivityData;
          }
        }

        stats.push({
          facility_id: facility.id,
          user_count: userCount || 0,
          active_user_count: activeUserCount || 0,
          attendance_records_count: attendanceCount,
          last_activity: (lastActivity as any)?.created_at,
        });
      }

      return stats;
    } catch (error) {
      throw new Error(`施設統計の取得中にエラーが発生しました: ${error}`);
    }
  }
}
