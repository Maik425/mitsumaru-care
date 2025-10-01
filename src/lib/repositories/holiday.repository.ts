import type {
  CreateHolidayRequestDto,
  GetHolidayRequestsDto,
  HolidayRequest,
} from '@/lib/dto/holiday.dto';
import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

type HolidayRequestsInsert = {
  user_id: string;
  type: 'regular' | 'exchange';
  dates: string[];
  reason: string | null;
};

type HolidayRequestsRow = HolidayRequest & {
  dates: string[];
};

export class HolidayRepository {
  constructor(private readonly client: SupabaseClient = supabase) {}

  async getHolidayRequests(
    userId: string,
    dto?: GetHolidayRequestsDto
  ): Promise<HolidayRequest[]> {
    const limit = dto?.limit ?? 20;
    const offset = dto?.offset ?? 0;

    let query = this.client
      .from('holiday_requests')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dto?.status) {
      query = query.eq('status', dto.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as HolidayRequest[];
  }

  async createHolidayRequest(
    userId: string,
    dto: CreateHolidayRequestDto
  ): Promise<HolidayRequest> {
    if (!dto.dates || dto.dates.length === 0) {
      throw new Error('日付を少なくとも1件指定してください');
    }

    const sortedDates = [...dto.dates].sort();

    const { data, error } = await this.client
      .from('holiday_requests')
      .insert({
        user_id: userId,
        type: dto.type,
        dates: sortedDates,
        reason: dto.reason ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return data as HolidayRequest;
  }
}
