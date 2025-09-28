'use client';

import {
  AuthProvider as InternalAuthProvider,
  useAuthState,
} from '@/components/auth-provider';
import type { AuthUser } from '@/lib/types/auth';
import { createContext, ReactNode } from 'react';

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
  return <InternalAuthProvider>{children}</InternalAuthProvider>;
}

export function useAuthContext() {
  return useAuthState();
}
