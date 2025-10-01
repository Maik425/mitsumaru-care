import {
  CreateHolidayRequestSchema,
  GetHolidayRequestsSchema,
} from '@/lib/dto/holiday.dto';
import { HolidayRepository } from '@/lib/repositories/holiday.repository';
import { TRPCError } from '@trpc/server';

import { publicProcedure, router } from '../trpc';

export const holidayRouter = router({
  list: publicProcedure
    .input(GetHolidayRequestsSchema.optional())
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const repo = new HolidayRepository(ctx.supabase);
      return repo.getHolidayRequests(ctx.user.id, input);
    }),

  create: publicProcedure
    .input(CreateHolidayRequestSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const repo = new HolidayRepository(ctx.supabase);
      return repo.createHolidayRequest(ctx.user.id, input);
    }),
});
