import { PrismaClient } from '@prisma/client';
import { createServerSupabaseClient } from '../../lib/supabase';

// Prismaクライアントのインスタンス
const prisma = new PrismaClient();

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
