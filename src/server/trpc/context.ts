import { PrismaClient } from '@prisma/client';
import { createServerSupabaseClient } from '../../lib/supabase';

// Prismaクライアントのインスタンス
const prisma = new PrismaClient();

// 認証済みユーザーの型定義
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  employeeNumber: string;
  permissions: string[];
}

export const createContext = async (opts: { req: Request; res: any }) => {
  const { req, res } = opts;

  // Supabaseクライアントの初期化
  const supabase = createServerSupabaseClient();

  // 認証情報の取得（簡易版）
  let user: AuthenticatedUser | null = null;

  try {
    // ヘッダーから認証情報を取得
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      // 簡易的な認証処理（実際の実装ではJWTトークンを検証）
      const token = authHeader.replace('Bearer ', '');

      // テスト用のユーザー情報（実際の実装ではDBから取得）
      if (token === 'admin-token') {
        user = {
          id: 'admin-001',
          email: 'admin@example.com',
          name: '管理者',
          employeeNumber: 'ADM001',
          permissions: [
            'ADMIN',
            'MANAGE_SHIFTS',
            'MANAGE_ATTENDANCE',
            'MANAGE_ROLES',
          ],
        };
      } else if (token === 'member-token') {
        user = {
          id: 'member-001',
          email: 'member@example.com',
          name: '一般職員',
          employeeNumber: 'MEM001',
          permissions: [
            'VIEW_SHIFTS',
            'MANAGE_OWN_ATTENDANCE',
            'REQUEST_SHIFT_EXCHANGE',
          ],
        };
      }
    }
  } catch (error) {
    console.error('認証エラー:', error);
  }

  return {
    req,
    res,
    prisma,
    supabase,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// 認証済みコンテキストの型定義
export interface AuthenticatedContext extends Context {
  user: AuthenticatedUser;
}
