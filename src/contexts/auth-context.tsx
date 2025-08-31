'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 認証コンテキストの型定義
interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: { name: string; employeeNumber: string }
  ) => Promise<{ error: string | null }>;
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーのプロパティ
interface AuthProviderProps {
  children: ReactNode;
}

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading] = useState(false);

  // サインイン
  const signIn = async (email: string, _password: string) => {
    try {
      // モック認証ロジック
      if (
        email === 'admin@mitsumaru.com' ||
        email === 'facility-admin@mitsumaru.com' ||
        email === 'staff@mitsumaru.com'
      ) {
        const mockUser = { email, id: `user-${Date.now()}` };
        setUser(mockUser);
        setSession({ user: mockUser });
        return { error: null };
      } else {
        return { error: '認証に失敗しました' };
      }
    } catch (error) {
      return { error: 'サインイン中にエラーが発生しました' };
    }
  };

  // サインアウト
  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('サインアウトエラー:', error);
    }
  };

  // サインアップ
  const signUp = async (
    email: string,
    _password: string,
    userData: { name: string; employeeNumber: string }
  ) => {
    try {
      // モックサインアップ
      const mockUser = { email, id: `user-${Date.now()}`, ...userData };
      setUser(mockUser);
      setSession({ user: mockUser });
      return { error: null };
    } catch (error) {
      return { error: 'サインアップ中にエラーが発生しました' };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 認証フック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
