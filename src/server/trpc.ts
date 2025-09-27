import { initTRPC } from '@trpc/server'
import { type NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export const createTRPCContext = (opts: { req: NextRequest; res?: any }) => {
  const { req, res } = opts

  return {
    req,
    res,
    supabase,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
