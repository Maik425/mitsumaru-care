'use client';

import { useAuth } from '@/hooks/use-auth';
import type { AuthUser } from '@/lib/types/auth';
import { createContext, ReactNode, useContext } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser | null }>;
  signOut: () => Promise<void>;
  requireAuth: (requiredRole?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
