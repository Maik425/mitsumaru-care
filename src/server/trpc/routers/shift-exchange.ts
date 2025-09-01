import { router, protectedProcedure, adminProcedure } from '../middleware/auth';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// シフト交換申請の入力スキーマ
const requestExchangeSchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  partnerId: z.string(),
  reason: z.string().min(1, '交換理由は必須です'),
});

// シフト交換承認の入力スキーマ
const approveExchangeSchema = z.object({
  exchangeId: z.string(),
  status: z.enum(['approved', 'rejected']),
  adminNotes: z.string().optional(),
});

// シフト交換取得の入力スキーマ
const getExchangeSchema = z.object({
  exchangeId: z.string(),
});

// シフト交換一覧の入力スキーマ
const listExchangesSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const shiftExchangeRouter = router({
  // シフト交換申請
  request: protectedProcedure
    .input(requestExchangeSchema)
    .mutation(async ({ ctx, input }) => {
      const { fromDate, toDate, partnerId, reason } = input;
      const userId = ctx.user?.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        });
      }

      try {
        // 既存の申請があるかチェック
        const existingRequest = await ctx.prisma.shiftExchange.findFirst({
          where: {
            requesterId: userId,
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            status: 'pending',
          },
        });

        if (existingRequest) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '同じ日付での交換申請が既に存在します',
          });
        }

        // パートナーの存在確認
        const partner = await ctx.prisma.user.findUnique({
          where: { id: partnerId },
        });

        if (!partner) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '指定されたパートナーが見つかりません',
          });
        }

        // シフト交換申請を作成
        const exchange = await ctx.prisma.shiftExchange.create({
          data: {
            requesterId: userId,
            partnerId: partnerId,
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            reason: reason,
            status: 'pending',
          },
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            partner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return exchange;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフト交換申請の作成中にエラーが発生しました',
        });
      }
    }),

  // シフト交換承認/却下
  approve: adminProcedure
    .input(approveExchangeSchema)
    .mutation(async ({ ctx, input }) => {
      const { exchangeId, status, adminNotes } = input;

      try {
        // 既存の申請を確認
        const existingExchange = await ctx.prisma.shiftExchange.findUnique({
          where: { id: exchangeId },
        });

        if (!existingExchange) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '指定されたシフト交換申請が見つかりません',
          });
        }

        if (existingExchange.status !== 'pending') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'この申請は既に処理済みです',
          });
        }

        // シフト交換申請を更新
        const updatedExchange = await ctx.prisma.shiftExchange.update({
          where: { id: exchangeId },
          data: {
            status: status,
            adminNotes: adminNotes,
            approvedAt: new Date(),
            approvedBy: ctx.user?.id,
          },
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            partner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return updatedExchange;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフト交換申請の処理中にエラーが発生しました',
        });
      }
    }),

  // シフト交換却下（エイリアス）
  reject: adminProcedure
    .input(
      z.object({ exchangeId: z.string(), adminNotes: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.shiftExchange.update({
        where: { id: input.exchangeId },
        data: {
          status: 'rejected',
          adminNotes: input.adminNotes,
          approvedAt: new Date(),
          approvedBy: ctx.user?.id,
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  // シフト交換詳細取得
  get: protectedProcedure
    .input(getExchangeSchema)
    .query(async ({ ctx, input }) => {
      const { exchangeId } = input;
      const userId = ctx.user?.id;

      try {
        const exchange = await ctx.prisma.shiftExchange.findUnique({
          where: { id: exchangeId },
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            partner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        if (!exchange) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '指定されたシフト交換申請が見つかりません',
          });
        }

        // 申請者または管理者のみアクセス可能
        if (
          exchange.requesterId !== userId &&
          !ctx.user?.permissions.includes('ADMIN')
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'この申請へのアクセス権限がありません',
          });
        }

        return exchange;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフト交換申請の取得中にエラーが発生しました',
        });
      }
    }),

  // シフト交換一覧取得
  list: protectedProcedure
    .input(listExchangesSchema)
    .query(async ({ ctx, input }) => {
      const { status, limit = 20, offset = 0 } = input;
      const userId = ctx.user?.id;

      try {
        const where: any = {};

        // 管理者は全件、一般ユーザーは自分の申請のみ
        if (!ctx.user?.permissions.includes('ADMIN')) {
          where.OR = [{ requesterId: userId }, { partnerId: userId }];
        }

        if (status) {
          where.status = status;
        }

        const exchanges = await ctx.prisma.shiftExchange.findMany({
          where,
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            partner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        });

        const total = await ctx.prisma.shiftExchange.count({ where });

        return {
          exchanges,
          total,
          hasMore: offset + limit < total,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフト交換申請一覧の取得中にエラーが発生しました',
        });
      }
    }),
});
