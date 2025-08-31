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

  return {
    req,
    res,
    prisma,
    supabase,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// 認証済みコンテキストの型定義
export interface AuthenticatedContext extends Context {
  user: AuthenticatedUser;
}
