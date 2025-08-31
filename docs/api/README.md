# API設計書

## 📋 1. 概要

このドキュメントでは、みつまるケアシステムのバックエンドAPI設計について詳細に説明します。

### 1.1 設計方針

- **tRPC**による型安全なAPI設計
- **RESTful**な設計原則の適用
- **適切なエラーハンドリング**とレスポンス形式
- **認証・認可**の一貫した実装
- **バリデーション**によるデータ整合性の確保

### 1.2 技術スタック

- **フレームワーク**: tRPC
- **言語**: TypeScript
- **認証**: Supabase Auth
- **バリデーション**: Zod
- **データベース**: Prisma + Supabase

## 🏗️ 2. APIアーキテクチャ

### 2.1 全体構成

```
src/server/trpc/
├── context.ts          # コンテキスト定義
├── trpc.ts            # tRPC設定
├── routers/           # ルーター定義
│   ├── index.ts       # メインルーター
│   ├── auth.ts        # 認証関連
│   ├── shift.ts       # シフト管理
│   ├── role.ts        # 役割表管理
│   ├── attendance.ts  # 勤怠管理
│   ├── user.ts        # ユーザー管理
│   └── master.ts      # マスターデータ
└── middleware/         # ミドルウェア
    ├── auth.ts        # 認証ミドルウェア
    └── validation.ts  # バリデーションミドルウェア
```

### 2.2 ルーター構造

```typescript
// src/server/trpc/routers/index.ts
import { router } from '../trpc';
import { authRouter } from './auth';
import { shiftRouter } from './shift';
import { roleRouter } from './role';
import { attendanceRouter } from './attendance';
import { userRouter } from './user';
import { masterRouter } from './master';

export const appRouter = router({
  auth: authRouter,
  shift: shiftRouter,
  role: roleRouter,
  attendance: attendanceRouter,
  user: userRouter,
  master: masterRouter,
});

export type AppRouter = typeof appRouter;
```

## 🔐 3. 認証・認可API

### 3.1 認証ルーター

```typescript
// src/server/trpc/routers/auth.ts
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  employeeNumber: z.string().min(1),
  tenantId: z.string().cuid(),
});

export const authRouter = router({
  // ログイン
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const { email, password } = input;

    try {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'ログインに失敗しました',
      });
    }
  }),

  // ユーザー登録
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password, name, employeeNumber, tenantId } = input;

      try {
        // ユーザー作成
        const { data: authData, error: authError } =
          await ctx.supabase.auth.signUp({
            email,
            password,
          });

        if (authError) throw authError;

        // ユーザー情報保存
        const user = await ctx.prisma.user.create({
          data: {
            id: authData.user!.id,
            email,
            name,
            employeeNumber,
            memberships: {
              create: {
                tenantId,
                role: 'MEMBER',
              },
            },
          },
        });

        return { user };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ユーザー登録に失敗しました',
        });
      }
    }),

  // ログアウト
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const { error } = await ctx.supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ログアウトに失敗しました',
      });
    }
  }),

  // 現在のユーザー取得
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          memberships: {
            include: {
              tenant: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー情報の取得に失敗しました',
      });
    }
  }),
});
```

### 3.2 認証ミドルウェア

```typescript
// src/server/trpc/middleware/auth.ts
import { TRPCError, initTRPC } from '@trpc/server';
import { Context } from '../context';

const t = initTRPC.context<Context>().create();

export const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '認証が必要です',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '認証が必要です',
    });
  }

  const membership = ctx.user.memberships.find(
    m => m.tenantId === ctx.tenantId
  );

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '管理者権限が必要です',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
```

## 📅 4. シフト管理API

### 4.1 シフトルーター

```typescript
// src/server/trpc/routers/shift.ts
import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../trpc';

const createShiftSchema = z.object({
  tenantId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shiftTypeId: z.string().cuid(),
  assignedUsers: z.array(
    z.object({
      userId: z.string().cuid(),
      positionId: z.string().cuid(),
      isSubstitute: z.boolean().optional(),
    })
  ),
});

const updateShiftSchema = z.object({
  id: z.string().cuid(),
  assignedUsers: z.array(
    z.object({
      userId: z.string().cuid(),
      positionId: z.string().cuid(),
      isSubstitute: z.boolean().optional(),
    })
  ),
  status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED']).optional(),
});

export const shiftRouter = router({
  // シフト作成
  create: adminProcedure
    .input(createShiftSchema)
    .mutation(async ({ input, ctx }) => {
      const { tenantId, date, shiftTypeId, assignedUsers } = input;

      try {
        const shift = await ctx.prisma.shift.create({
          data: {
            tenantId,
            date,
            shiftTypeId,
            assignedUsers: {
              create: assignedUsers.map(user => ({
                userId: user.userId,
                positionId: user.positionId,
                isSubstitute: user.isSubstitute || false,
              })),
            },
            status: 'DRAFT',
          },
          include: {
            shiftType: true,
            assignedUsers: {
              include: {
                user: true,
                position: true,
              },
            },
          },
        });

        return shift;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフトの作成に失敗しました',
        });
      }
    }),

  // シフト更新
  update: adminProcedure
    .input(updateShiftSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, assignedUsers, status } = input;

      try {
        // 既存の割り当てを削除
        await ctx.prisma.shiftAssignment.deleteMany({
          where: { shiftId: id },
        });

        // 新しい割り当てを作成
        const shift = await ctx.prisma.shift.update({
          where: { id },
          data: {
            assignedUsers: {
              create: assignedUsers.map(user => ({
                userId: user.userId,
                positionId: user.positionId,
                isSubstitute: user.isSubstitute || false,
              })),
            },
            status: status || 'DRAFT',
          },
          include: {
            shiftType: true,
            assignedUsers: {
              include: {
                user: true,
                position: true,
              },
            },
          },
        });

        return shift;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフトの更新に失敗しました',
        });
      }
    }),

  // シフト取得（月別）
  getByMonth: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().cuid(),
        year: z.number().int().min(2000).max(2100),
        month: z.number().int().min(1).max(12),
      })
    )
    .query(async ({ input, ctx }) => {
      const { tenantId, year, month } = input;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      try {
        const shifts = await ctx.prisma.shift.findMany({
          where: {
            tenantId,
            date: {
              gte: startDate.toISOString().split('T')[0],
              lte: endDate.toISOString().split('T')[0],
            },
          },
          include: {
            shiftType: true,
            assignedUsers: {
              include: {
                user: true,
                position: true,
              },
            },
          },
          orderBy: { date: 'asc' },
        });

        return shifts;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフトの取得に失敗しました',
        });
      }
    }),

  // シフト削除
  delete: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      try {
        await ctx.prisma.shift.delete({
          where: { id },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフトの削除に失敗しました',
        });
      }
    }),
});
```

## 👥 5. 役割表管理API

### 5.1 役割表ルーター

```typescript
// src/server/trpc/routers/role.ts
import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../trpc';

const createRoleAssignmentSchema = z.object({
  tenantId: z.string().cuid(),
  shiftId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  assignments: z.array(
    z.object({
      userId: z.string().cuid(),
      roleName: z.string().min(1),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      notes: z.string().optional(),
    })
  ),
});

export const roleRouter = router({
  // 役割割り当て作成
  create: adminProcedure
    .input(createRoleAssignmentSchema)
    .mutation(async ({ input, ctx }) => {
      const { tenantId, shiftId, date, assignments } = input;

      try {
        const roleAssignment = await ctx.prisma.roleAssignment.create({
          data: {
            tenantId,
            shiftId,
            date,
            assignments: {
              create: assignments.map(assignment => ({
                userId: assignment.userId,
                roleName: assignment.roleName,
                startTime: assignment.startTime,
                endTime: assignment.endTime,
                notes: assignment.notes,
              })),
            },
            status: 'DRAFT',
          },
          include: {
            assignments: {
              include: {
                user: true,
              },
            },
          },
        });

        return roleAssignment;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役割割り当ての作成に失敗しました',
        });
      }
    }),

  // 役割割り当て取得（日別）
  getByDate: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().cuid(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ input, ctx }) => {
      const { tenantId, date } = input;

      try {
        const roleAssignment = await ctx.prisma.roleAssignment.findFirst({
          where: {
            tenantId,
            date,
          },
          include: {
            assignments: {
              include: {
                user: true,
              },
            },
          },
        });

        return roleAssignment;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役割割り当ての取得に失敗しました',
        });
      }
    }),

  // 役割割り当て確定
  publish: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      try {
        const roleAssignment = await ctx.prisma.roleAssignment.update({
          where: { id },
          data: { status: 'PUBLISHED' },
        });

        return roleAssignment;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役割割り当ての確定に失敗しました',
        });
      }
    }),
});
```

## ⏰ 6. 勤怠管理API

### 6.1 勤怠ルーター

```typescript
// src/server/trpc/routers/attendance.ts
import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../trpc';

const checkInSchema = z.object({
  userId: z.string().cuid(),
  shiftId: z.string().cuid(),
  actualStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

const checkOutSchema = z.object({
  userId: z.string().cuid(),
  shiftId: z.string().cuid(),
  actualEndTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

export const attendanceRouter = router({
  // 出勤打刻
  checkIn: protectedProcedure
    .input(checkInSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId, shiftId, actualStartTime, notes } = input;

      try {
        const attendance = await ctx.prisma.attendance.upsert({
          where: {
            userId_shiftId: {
              userId,
              shiftId,
            },
          },
          update: {
            actualStartTime,
            status: 'CHECKED_IN',
            notes,
            updatedAt: new Date(),
          },
          create: {
            userId,
            shiftId,
            actualStartTime,
            status: 'CHECKED_IN',
            notes,
          },
        });

        return attendance;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '出勤打刻に失敗しました',
        });
      }
    }),

  // 退勤打刻
  checkOut: protectedProcedure
    .input(checkOutSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId, shiftId, actualEndTime, notes } = input;

      try {
        const attendance = await ctx.prisma.attendance.update({
          where: {
            userId_shiftId: {
              userId,
              shiftId,
            },
          },
          data: {
            actualEndTime,
            status: 'CHECKED_OUT',
            notes,
            updatedAt: new Date(),
          },
        });

        return attendance;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '退勤打刻に失敗しました',
        });
      }
    }),

  // 勤怠一覧取得（日別）
  getByDate: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().cuid(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ input, ctx }) => {
      const { tenantId, date } = input;

      try {
        const attendances = await ctx.prisma.attendance.findMany({
          where: {
            shift: {
              tenantId,
              date,
            },
          },
          include: {
            user: true,
            shift: {
              include: {
                shiftType: true,
              },
            },
          },
          orderBy: {
            user: { name: 'asc' },
          },
        });

        return attendances;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '勤怠情報の取得に失敗しました',
        });
      }
    }),

  // 勤怠承認
  approve: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.enum(['APPROVED', 'REJECTED']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, status, notes } = input;

      try {
        const attendance = await ctx.prisma.attendance.update({
          where: { id },
          data: {
            status,
            notes,
            updatedAt: new Date(),
          },
        });

        return attendance;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '勤怠承認に失敗しました',
        });
      }
    }),
});
```

## 👤 7. ユーザー管理API

### 7.1 ユーザールーター

```typescript
// src/server/trpc/routers/user.ts
import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../trpc';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  employeeNumber: z.string().min(1),
  phoneNumber: z.string().optional(),
  positionId: z.string().cuid(),
  skillIds: z.array(z.string().cuid()),
  tenantId: z.string().cuid(),
});

const updateUserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  positionId: z.string().cuid().optional(),
  skillIds: z.array(z.string().cuid()).optional(),
  isActive: z.boolean().optional(),
});

export const userRouter = router({
  // ユーザー作成
  create: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        email,
        name,
        employeeNumber,
        phoneNumber,
        positionId,
        skillIds,
        tenantId,
      } = input;

      try {
        const user = await ctx.prisma.user.create({
          data: {
            email,
            name,
            employeeNumber,
            phoneNumber,
            memberships: {
              create: {
                tenantId,
                role: 'MEMBER',
              },
            },
            positions: {
              create: {
                positionId,
              },
            },
            skills: {
              create: skillIds.map(skillId => ({
                skillId,
              })),
            },
          },
          include: {
            memberships: {
              include: {
                tenant: true,
              },
            },
            positions: {
              include: {
                position: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        });

        return user;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ユーザーの作成に失敗しました',
        });
      }
    }),

  // ユーザー一覧取得
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().cuid(),
        search: z.string().optional(),
        positionId: z.string().cuid().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { tenantId, search, positionId, isActive } = input;

      try {
        const users = await ctx.prisma.user.findMany({
          where: {
            memberships: {
              some: {
                tenantId,
              },
            },
            ...(search && {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { employeeNumber: { contains: search, mode: 'insensitive' } },
              ],
            }),
            ...(positionId && {
              positions: {
                some: { positionId },
              },
            }),
            ...(isActive !== undefined && { isActive }),
          },
          include: {
            memberships: {
              where: { tenantId },
            },
            positions: {
              include: {
                position: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        });

        return users;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ユーザー一覧の取得に失敗しました',
        });
      }
    }),

  // ユーザー更新
  update: adminProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      try {
        const user = await ctx.prisma.user.update({
          where: { id },
          data: updateData,
          include: {
            memberships: {
              include: {
                tenant: true,
              },
            },
            positions: {
              include: {
                position: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        });

        return user;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'ユーザーの更新に失敗しました',
        });
      }
    }),
});
```

## ⚙️ 8. マスターデータ管理API

### 8.1 マスターデータルーター

```typescript
// src/server/trpc/routers/master.ts
import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../trpc';

const shiftTypeSchema = z.object({
  name: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakTime: z.number().int().min(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
});

const positionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  requiredSkillIds: z.array(z.string().cuid()),
});

const skillSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['CARE', 'MEDICAL', 'ADMINISTRATIVE', 'OTHER']),
  description: z.string().optional(),
});

export const masterRouter = router({
  // シフト形態管理
  shiftTypes: router({
    create: adminProcedure
      .input(shiftTypeSchema)
      .mutation(async ({ input, ctx }) => {
        const { name, startTime, endTime, breakTime, color } = input;

        try {
          const shiftType = await ctx.prisma.shiftType.create({
            data: {
              tenantId: ctx.tenantId!,
              name,
              startTime,
              endTime,
              breakTime,
              color,
            },
          });

          return shiftType;
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'シフト形態の作成に失敗しました',
          });
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        const shiftTypes = await ctx.prisma.shiftType.findMany({
          where: {
            tenantId: ctx.tenantId!,
            isActive: true,
          },
          orderBy: { name: 'asc' },
        });

        return shiftTypes;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'シフト形態の取得に失敗しました',
        });
      }
    }),
  }),

  // 役職管理
  positions: router({
    create: adminProcedure
      .input(positionSchema)
      .mutation(async ({ input, ctx }) => {
        const { name, description, requiredSkillIds } = input;

        try {
          const position = await ctx.prisma.position.create({
            data: {
              tenantId: ctx.tenantId!,
              name,
              description,
              requiredSkills: requiredSkillIds,
            },
          });

          return position;
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '役職の作成に失敗しました',
          });
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        const positions = await ctx.prisma.position.findMany({
          where: {
            tenantId: ctx.tenantId!,
            isActive: true,
          },
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        });

        return positions;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '役職の取得に失敗しました',
        });
      }
    }),
  }),

  // 技能管理
  skills: router({
    create: adminProcedure
      .input(skillSchema)
      .mutation(async ({ input, ctx }) => {
        const { name, category, description } = input;

        try {
          const skill = await ctx.prisma.skill.create({
            data: {
              tenantId: ctx.tenantId!,
              name,
              category,
              description,
            },
          });

          return skill;
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '技能の作成に失敗しました',
          });
        }
      }),

    list: protectedProcedure
      .input(
        z.object({
          category: z
            .enum(['CARE', 'MEDICAL', 'ADMINISTRATIVE', 'OTHER'])
            .optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        const { category } = input;

        try {
          const skills = await ctx.prisma.skill.findMany({
            where: {
              tenantId: ctx.tenantId!,
              isActive: true,
              ...(category && { category }),
            },
            orderBy: { name: 'asc' },
          });

          return skills;
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '技能の取得に失敗しました',
          });
        }
      }),
  }),
});
```

## ⚠️ 9. エラーハンドリング

### 9.1 エラーコード定義

```typescript
// src/server/trpc/errors.ts
export const ErrorCodes = {
  // 認証・認可エラー
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // バリデーションエラー
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // データベースエラー
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',

  // ビジネスロジックエラー
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
} as const;

export const ErrorMessages = {
  [ErrorCodes.UNAUTHORIZED]: '認証が必要です',
  [ErrorCodes.FORBIDDEN]: 'アクセス権限がありません',
  [ErrorCodes.BAD_REQUEST]: 'リクエストが不正です',
  [ErrorCodes.VALIDATION_ERROR]: '入力値が正しくありません',
  [ErrorCodes.NOT_FOUND]: 'リソースが見つかりません',
  [ErrorCodes.CONFLICT]: 'データが重複しています',
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'サーバー内部エラーが発生しました',
  [ErrorCodes.BUSINESS_RULE_VIOLATION]: 'ビジネスルールに違反しています',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: '権限が不足しています',
} as const;
```

### 9.2 エラーレスポンス形式

```typescript
// エラーレスポンスの例
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が正しくありません",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      },
      {
        "field": "password",
        "message": "パスワードは8文字以上で入力してください"
      }
    ]
  }
}
```

## 📊 10. レスポンス形式

### 10.1 成功レスポンス

```typescript
// 単一データ
{
  "data": {
    "id": "clx1234567890",
    "name": "田中 花子",
    "email": "tanaka@example.com",
    "employeeNumber": "001"
  }
}

// リストデータ
{
  "data": [
    {
      "id": "clx1234567890",
      "name": "田中 花子"
    },
    {
      "id": "clx1234567891",
      "name": "佐藤 太郎"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 10.2 ページネーション

```typescript
// ページネーションパラメータ
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ページネーション実装例
export const listWithPagination = async (params: PaginationParams) => {
  const { page, limit, sortBy, sortOrder } = params;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
```

---

**次段階**: [第3段階：実装設計](./../database/README.md) に進む
