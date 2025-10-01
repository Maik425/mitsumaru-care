import { z } from 'zod';

export const HolidayRequestType = z.enum(['regular', 'exchange']);
export const HolidayRequestStatus = z.enum(['pending', 'approved', 'rejected']);

export const HolidayRequestSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: HolidayRequestType,
  dates: z.array(z.string()),
  submitted_at: z.coerce.date(),
  status: HolidayRequestStatus,
  reason: z.string().nullable().optional(),
  reject_reason: z.string().nullable().optional(),
  approved_at: z.coerce.date().nullable().optional(),
});

export type HolidayRequest = z.infer<typeof HolidayRequestSchema>;

export const CreateHolidayRequestSchema = z.object({
  type: HolidayRequestType,
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  reason: z
    .union([z.string().trim().min(1), z.null()])
    .optional()
    .transform(value => (value === undefined ? null : value)),
});

export const GetHolidayRequestsSchema = z.object({
  status: HolidayRequestStatus.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type CreateHolidayRequestDto = z.infer<
  typeof CreateHolidayRequestSchema
>;
export type GetHolidayRequestsDto = z.infer<typeof GetHolidayRequestsSchema>;
