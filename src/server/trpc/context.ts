export async function createContext() {
  // デモ用（本番はAuth.js連携で実ユーザー/テナントを解決）
  return {
    user: { id: 'demo-user-1' },
    tenantId: 'demo-tenant-1',
    role: 'OWNER' as const,
  };
}

export type AppContext = Awaited<ReturnType<typeof createContext>>;
