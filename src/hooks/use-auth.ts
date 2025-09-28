'use client';

import { supabase } from '@/lib/supabase';
import type { AuthUser, UserRole } from '@/lib/types/auth';
import type { PostgrestError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type RpcUserRecord = {
  id: string;
  email: string | null;
  name: string;
  role: UserRole;
  facility_id: string | null;
  is_active: boolean;
};

const STORAGE_KEY = 'auth:user';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    } catch (error) {
      console.warn('Failed to parse stored auth user', error);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const sessionChecked = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        clearAuthUser();
      }
    });

    const checkInitialSession = async () => {
      if (sessionChecked.current) return;
      sessionChecked.current = true;
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        clearAuthUser();
      }
      setLoading(false);
    };

    void checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const clearAuthUser = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = (await (supabase as any).rpc(
        'public_get_current_user_with_email',
        {
          target_id: userId,
        }
      )) as {
        data: RpcUserRecord[] | null;
        error: PostgrestError | null;
      };

      if (error) {
        console.error('ユーザーデータ取得エラー:', error);
        clearAuthUser();
        return;
      }

      const userRecord = data?.[0];

      if (userRecord && userRecord.is_active) {
        const authUser: AuthUser = {
          id: userRecord.id,
          email: userRecord.email || '',
          name: userRecord.name,
          role: userRecord.role,
          facility_id: userRecord.facility_id || undefined,
        };
        setUser(authUser);
      } else {
        clearAuthUser();
      }
    } catch (error) {
      console.error('ユーザーデータ取得中にエラー:', error);
      clearAuthUser();
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await fetchUserData(data.user.id);
        setLoading(false);
        return { success: true, user: data.user };
      }

      setLoading(false);
      return { success: false, error: 'ログインに失敗しました' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      console.log('ログアウト開始');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabaseログアウトエラー:', error);
        throw error;
      }
      console.log('ログアウト成功');
      clearAuthUser();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      clearAuthUser();
      router.push('/login');
    }
  };

  const requireAuth = (requiredRole?: string) => {
    if (loading) return false;
    if (!user) return false;
    if (requiredRole && user.role !== requiredRole) return false;
    return true;
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    requireAuth,
  };
}
